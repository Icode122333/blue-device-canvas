-- Add username and CHW profile fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS residence TEXT;

-- Case-insensitive unique index on username (ignores NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_ci
  ON public.profiles (lower(username))
  WHERE username IS NOT NULL;

-- Update new user handler to store username from metadata if provided
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, onboarding_completed, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
    FALSE,
    NULLIF(NEW.raw_user_meta_data->>'username', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
