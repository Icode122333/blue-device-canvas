-- CHW assignments: map CHW users to patient users
CREATE TABLE public.chw_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chw_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (chw_id, patient_id)
);

ALTER TABLE public.chw_assignments ENABLE ROW LEVEL SECURITY;

-- CHW can view their assignments
CREATE POLICY "CHW can view own assignments"
ON public.chw_assignments
FOR SELECT TO authenticated
USING (auth.uid() = chw_id);

-- Allow CHW to insert own
CREATE POLICY "CHW can insert own assignments"
ON public.chw_assignments
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = chw_id);

-- Admin (physio) can view/manage all assignments
DO $$ BEGIN
  CREATE POLICY "Physio can view all assignments"
  ON public.chw_assignments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'physio'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Physio can insert assignments"
  ON public.chw_assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'physio'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Physio can delete assignments"
  ON public.chw_assignments
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'physio'
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Community questions submitted by patients
CREATE TABLE public.community_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.community_questions ENABLE ROW LEVEL SECURITY;

-- Patients: select/insert own
CREATE POLICY "Users can view own questions"
ON public.community_questions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own questions"
ON public.community_questions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- CHWs can view all community questions
CREATE POLICY "CHWs can view all community questions"
ON public.community_questions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'chw'
  )
);

-- CHW reports submitted to admin
CREATE TABLE public.chw_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chw_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  attachment_url TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','reviewed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.chw_reports ENABLE ROW LEVEL SECURITY;

-- CHW can insert/select own reports
CREATE POLICY "CHW can insert own reports"
ON public.chw_reports
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = chw_id);

CREATE POLICY "CHW can view own reports"
ON public.chw_reports
FOR SELECT TO authenticated
USING (auth.uid() = chw_id);

-- Timestamp trigger
CREATE TRIGGER update_chw_reports_updated_at
BEFORE UPDATE ON public.chw_reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for reports attachments (public for simplicity)
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', true)
ON CONFLICT (id) DO NOTHING;

-- Public read for reports bucket
CREATE POLICY "Reports are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'reports');

-- Only owner can write within their folder (reports/<user_id>/...)
CREATE POLICY "Users can upload their own reports"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own reports"
ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own reports"
ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'reports' AND auth.uid()::text = (storage.foldername(name))[1]);
