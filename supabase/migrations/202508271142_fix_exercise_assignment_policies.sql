-- Fix RLS policies for patient exercise assignments and videos

-- 1. Ensure patient_exercise_assignments has the correct RLS policy for patients
DO $$
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Patients can view their own exercise assignments" ON public.patient_exercise_assignments;
  
  -- Recreate the policy with correct patient ID matching
  CREATE POLICY "Patients can view their own exercise assignments"
  ON public.patient_exercise_assignments
  FOR SELECT TO authenticated
  USING (auth.uid() = patient_id);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error creating patient exercise assignments policy: %', SQLERRM;
END $$;

-- 2. Ensure exercise_videos has the correct RLS policy for patients
DO $$
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Patients can view assigned exercise videos" ON public.exercise_videos;
  
  -- Recreate the policy to allow patients to see videos assigned to them
  CREATE POLICY "Patients can view assigned exercise videos"
  ON public.exercise_videos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.patient_exercise_assignments a
      WHERE a.video_id = exercise_videos.id 
      AND a.patient_id = auth.uid()
    )
  );
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error creating exercise videos policy: %', SQLERRM;
END $$;

-- 3. Ensure exercise_videos bucket has correct public access
DO $$
BEGIN
  -- Make sure the bucket exists
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('exercise-videos', 'exercise-videos', true)
  ON CONFLICT (id) DO UPDATE SET public = true;
  
  -- Set public read access to exercise videos
  DROP POLICY IF EXISTS "Exercise videos are publicly readable" ON storage.objects;
  CREATE POLICY "Exercise videos are publicly readable"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'exercise-videos');
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error setting up exercise videos bucket: %', SQLERRM;
END $$;
