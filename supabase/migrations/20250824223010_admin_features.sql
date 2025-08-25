-- Admin features: appointment decisions + notifications, patient assessments, question assignment + replies, and RLS

-- 1) Appointments: decision metadata
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS decision_reason TEXT,
  ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS decided_by UUID REFERENCES auth.users(id);

-- Require a reason when rejected
DO $$ BEGIN
  ALTER TABLE public.appointments
    ADD CONSTRAINT appointments_rejected_requires_reason
    CHECK (status <> 'rejected' OR decision_reason IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE INDEX IF NOT EXISTS idx_appointments_decided_at ON public.appointments(decided_at);

-- Functions to set metadata and notify patient on decision
CREATE OR REPLACE FUNCTION public.set_appointment_decision_metadata()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE') AND (OLD.status IS DISTINCT FROM NEW.status) AND NEW.status IN ('approved','rejected') THEN
    IF NEW.decided_at IS NULL THEN NEW.decided_at := now(); END IF;
    IF NEW.decided_by IS NULL THEN NEW.decided_by := auth.uid(); END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_appointment_decision()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE') AND (OLD.status IS DISTINCT FROM NEW.status) AND NEW.status IN ('approved','rejected') THEN
    INSERT INTO public.notifications (user_id, type, payload)
    VALUES (
      NEW.user_id,
      'appointment_decision',
      jsonb_build_object(
        'appointment_id', NEW.id,
        'status', NEW.status,
        'reason', NEW.decision_reason,
        'scheduled_at', NEW.scheduled_at
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_appointment_decision_metadata ON public.appointments;
CREATE TRIGGER trg_set_appointment_decision_metadata
BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.set_appointment_decision_metadata();

DROP TRIGGER IF EXISTS trg_notify_appointment_decision ON public.appointments;
CREATE TRIGGER trg_notify_appointment_decision
AFTER UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.notify_appointment_decision();

-- 2) Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('appointment_decision','question_reply')),
  payload JSONB NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can read their notifications"
  ON public.notifications
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update their notifications (read flag)"
  ON public.notifications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) Patient assessments (filled by physiotherapist)
CREATE TABLE IF NOT EXISTS public.patient_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  physio_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  -- 1. Patient Information
  full_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  address_district TEXT,
  address_sector TEXT,
  address_cell TEXT,
  address_village TEXT,
  caregiver_name TEXT,
  caregiver_contact TEXT,
  gmfc_level TEXT,
  functional_complaint TEXT,
  -- 2. Medical Background
  prenatal_mothers_age INT,
  prenatal_folic_acid BOOLEAN,
  prenatal_drugs TEXT,
  prenatal_infections TEXT,
  perinatal_mode_of_delivery TEXT,
  perinatal_complications TEXT,
  perinatal_apgar TEXT,
  perinatal_trauma TEXT,
  postnatal_jaundice BOOLEAN,
  postnatal_brain_trauma TEXT,
  postnatal_surgery TEXT,
  postnatal_prior_treatments TEXT,
  developmental_delayed_milestones TEXT,
  developmental_response_prior_treatments TEXT,
  -- 3. Functional & Environmental Assessment
  env_home_school_accessibility TEXT,
  env_assistive_devices TEXT,
  env_communication_ability TEXT,
  env_attention_span TEXT,
  env_gait_posture_deformities TEXT,
  env_nutrition_feeding TEXT,
  env_involuntary_movements TEXT,
  env_continence_hygiene TEXT,
  -- 4. Motor & Neurological Evaluation
  motor_gross_fine_skills TEXT,
  motor_reflexes TEXT,
  motor_sensory_perception TEXT,
  motor_balance_coordination TEXT,
  motor_tone_contractures_tightness TEXT,
  motor_range_of_motion TEXT,
  -- 5. Rehabilitation Summary
  rehab_functional_level TEXT,
  rehab_recommendations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_patient_assessments_patient_id ON public.patient_assessments(patient_id);

ALTER TABLE public.patient_assessments ENABLE ROW LEVEL SECURITY;

-- RLS: patients can view their own; physios can view/insert/update; CHWs can view for assigned patients
DO $$ BEGIN
  CREATE POLICY "Patients can view their assessments"
  ON public.patient_assessments
  FOR SELECT TO authenticated
  USING (auth.uid() = patient_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Physio: SELECT
DO $$ BEGIN
  CREATE POLICY "Physios can view assessments"
  ON public.patient_assessments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'physio'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Physio: INSERT
DO $$ BEGIN
  CREATE POLICY "Physios can insert assessments"
  ON public.patient_assessments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'physio'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Physio: UPDATE
DO $$ BEGIN
  CREATE POLICY "Physios can update assessments"
  ON public.patient_assessments
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'physio'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'physio'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "CHWs can view assessments for assigned patients"
  ON public.patient_assessments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chw_assignments ca
      WHERE ca.chw_id = auth.uid() AND ca.patient_id = patient_assessments.patient_id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4) Community questions assignment and replies
ALTER TABLE public.community_questions
  ADD COLUMN IF NOT EXISTS assigned_physio_id UUID REFERENCES auth.users(id);

-- Physio can view questions assigned to them
DO $$ BEGIN
  CREATE POLICY "Physio can view assigned questions"
  ON public.community_questions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'physio'
    )
    AND assigned_physio_id = auth.uid()
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Physio can assign questions to themselves or others physios
DO $$ BEGIN
  CREATE POLICY "Physio can assign questions"
  ON public.community_questions
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'physio'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'physio'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Physios can view unassigned community questions for triage
DO $$ BEGIN
  CREATE POLICY "Physio can view unassigned questions"
  ON public.community_questions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'physio'
    )
    AND assigned_physio_id IS NULL
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Replies table
CREATE TABLE IF NOT EXISTS public.community_question_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.community_questions(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  responder_role TEXT NOT NULL CHECK (responder_role IN ('physio','chw','patient')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_question_replies ENABLE ROW LEVEL SECURITY;

-- Physio can reply to assigned questions
DO $$ BEGIN
  CREATE POLICY "Physio can reply to assigned questions"
  ON public.community_question_replies
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'physio'
    )
    AND EXISTS (
      SELECT 1 FROM public.community_questions q
      WHERE q.id = community_question_replies.question_id
        AND q.assigned_physio_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- View replies: question owner, CHWs (all), assigned physio
DO $$ BEGIN
  CREATE POLICY "Users can view replies they are entitled to"
  ON public.community_question_replies
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.community_questions q
      WHERE q.id = community_question_replies.question_id
        AND (
          q.user_id = auth.uid() -- patient owner
          OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'physio' AND q.assigned_physio_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.user_id = auth.uid() AND p.role = 'chw'
          )
        )
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Notify patient on reply
CREATE OR REPLACE FUNCTION public.notify_question_reply()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  q_user UUID;
BEGIN
  SELECT user_id INTO q_user FROM public.community_questions WHERE id = NEW.question_id;
  IF q_user IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, payload)
    VALUES (
      q_user,
      'question_reply',
      jsonb_build_object(
        'question_id', NEW.question_id,
        'reply_id', NEW.id
      )
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_question_reply ON public.community_question_replies;
CREATE TRIGGER trg_notify_question_reply
AFTER INSERT ON public.community_question_replies
FOR EACH ROW EXECUTE FUNCTION public.notify_question_reply();

-- 5) Profiles: allow physio to read profiles (to select patients in UI)
DO $$ BEGIN
  CREATE POLICY "Physio can read profiles"
  ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p2
      WHERE p2.user_id = auth.uid() AND p2.role = 'physio'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow physio to view patient onboarding details
DO $$ BEGIN
  CREATE POLICY "Physio can view patient onboarding"
  ON public.patient_onboarding
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'physio'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
