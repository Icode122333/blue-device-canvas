-- Community feed visibility and participation
-- 1) Let all authenticated users view all community questions
DO $$ BEGIN
  CREATE POLICY "Community can view all questions"
  ON public.community_questions
  FOR SELECT TO authenticated
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Let all authenticated users view replies to any community question
DO $$ BEGIN
  CREATE POLICY "Community can view all replies"
  ON public.community_question_replies
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.community_questions q
      WHERE q.id = community_question_replies.question_id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 3) Allow patients/CHWs to reply to any community question
DO $$ BEGIN
  CREATE POLICY "Patients and CHWs can reply"
  ON public.community_question_replies
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role IN ('patient','chw')
    )
    AND EXISTS (
      SELECT 1 FROM public.community_questions q
      WHERE q.id = community_question_replies.question_id
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
