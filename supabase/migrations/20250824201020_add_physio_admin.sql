-- Add 'physio' role to profiles.role constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('patient','chw','physio'));

-- Ensure appointments RLS is enabled (should already be in earlier migration)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Physio can read all appointments
DROP POLICY IF EXISTS "physio can read appointments" ON public.appointments;
CREATE POLICY "physio can read appointments"
ON public.appointments
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'physio'
  )
);

-- Physio can manage (insert/update/delete) appointments
DROP POLICY IF EXISTS "physio can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "physio can update appointments" ON public.appointments;
DROP POLICY IF EXISTS "physio can delete appointments" ON public.appointments;
-- Insert
CREATE POLICY "physio can insert appointments"
ON public.appointments
FOR INSERT TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'physio'
  )
);
-- Update
CREATE POLICY "physio can update appointments"
ON public.appointments
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
-- Delete
CREATE POLICY "physio can delete appointments"
ON public.appointments
FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'physio'
  )
);

-- Allow physio to view all community questions
DROP POLICY IF EXISTS "Physio can view all community questions" ON public.community_questions;
CREATE POLICY "Physio can view all community questions"
ON public.community_questions
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'physio'
  )
);

-- Allow physio to view all CHW reports
DROP POLICY IF EXISTS "Physio can view all CHW reports" ON public.chw_reports;
CREATE POLICY "Physio can view all CHW reports"
ON public.chw_reports
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'physio'
  )
);

-- Allow physio to update CHW reports (e.g., mark reviewed)
DROP POLICY IF EXISTS "Physio can update CHW reports" ON public.chw_reports;
CREATE POLICY "Physio can update CHW reports"
ON public.chw_reports
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'physio'
  )
);
