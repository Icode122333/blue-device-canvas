-- 1) Add optional Google Meet link to appointments
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS google_meet_link TEXT;

-- 2) Exercise videos master table
CREATE TABLE IF NOT EXISTS public.exercise_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT,
  difficulty TEXT DEFAULT 'easy' CHECK (difficulty IN ('easy','medium','hard')),
  duration_seconds INTEGER CHECK (duration_seconds >= 0),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.exercise_videos ENABLE ROW LEVEL SECURITY;

-- Physio full access on exercise_videos (using helper public.is_physio from 20250825000030_fix_profiles_physio_policy.sql)
DO $$ BEGIN
  CREATE POLICY "Physio can view all exercise videos"
  ON public.exercise_videos
  FOR SELECT TO authenticated
  USING (public.is_physio(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Physio can insert exercise videos"
  ON public.exercise_videos
  FOR INSERT TO authenticated
  WITH CHECK (public.is_physio(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Physio can update exercise videos"
  ON public.exercise_videos
  FOR UPDATE TO authenticated
  USING (public.is_physio(auth.uid()))
  WITH CHECK (public.is_physio(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Physio can delete exercise videos"
  ON public.exercise_videos
  FOR DELETE TO authenticated
  USING (public.is_physio(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) Patient exercise assignments
CREATE TABLE IF NOT EXISTS public.patient_exercise_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID NOT NULL REFERENCES public.exercise_videos(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (patient_id, video_id)
);

ALTER TABLE public.patient_exercise_assignments ENABLE ROW LEVEL SECURITY;

-- Physio full access on assignments
DO $$ BEGIN
  CREATE POLICY "Physio can view all exercise assignments"
  ON public.patient_exercise_assignments
  FOR SELECT TO authenticated
  USING (public.is_physio(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Physio can insert exercise assignments"
  ON public.patient_exercise_assignments
  FOR INSERT TO authenticated
  WITH CHECK (public.is_physio(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Physio can delete exercise assignments"
  ON public.patient_exercise_assignments
  FOR DELETE TO authenticated
  USING (public.is_physio(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Patients can view their own assignments
DO $$ BEGIN
  CREATE POLICY "Patients can view their own exercise assignments"
  ON public.patient_exercise_assignments
  FOR SELECT TO authenticated
  USING (auth.uid() = patient_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Allow patients to select exercise_videos only if assigned
DO $$ BEGIN
  CREATE POLICY "Patients can view assigned exercise videos"
  ON public.exercise_videos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.patient_exercise_assignments a
      WHERE a.video_id = exercise_videos.id AND a.patient_id = auth.uid()
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 4) Timestamps trigger on exercise_videos
DO $$ BEGIN
  CREATE TRIGGER update_exercise_videos_updated_at
  BEFORE UPDATE ON public.exercise_videos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 5) Storage bucket for exercise videos
INSERT INTO storage.buckets (id, name, public) VALUES ('exercise-videos', 'exercise-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for exercise videos
DO $$ BEGIN
  CREATE POLICY "Exercise videos are publicly readable"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'exercise-videos');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Only physios can upload/update/delete in this bucket
DO $$ BEGIN
  CREATE POLICY "Physios can upload exercise videos"
  ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'exercise-videos' AND public.is_physio(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Physios can update exercise videos"
  ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'exercise-videos' AND public.is_physio(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Physios can delete exercise videos"
  ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'exercise-videos' AND public.is_physio(auth.uid()));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
