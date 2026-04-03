-- Up Migration: Add subjective and objective jsonb columns
ALTER TABLE public.patient_assessments
  ADD COLUMN IF NOT EXISTS subjective_assessment JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS objective_assessment JSONB DEFAULT '{}'::jsonb;
