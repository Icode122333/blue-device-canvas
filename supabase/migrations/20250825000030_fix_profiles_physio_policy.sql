-- Fix recursive RLS on public.profiles causing 500 errors when selecting profiles
-- Adds a SECURITY DEFINER helper and recreates the policy to avoid self-referencing queries

-- 1) Helper function to check physio role without triggering RLS recursion
create or replace function public.is_physio(uid uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.user_id = uid and p.role = 'physio'
  );
$$;

revoke all on function public.is_physio(uuid) from public;
grant execute on function public.is_physio(uuid) to authenticated;

-- 2) Recreate the policy using the helper
drop policy if exists "Physio can read profiles" on public.profiles;

create policy "Physio can read profiles"
on public.profiles
for select to authenticated
using (public.is_physio(auth.uid()));
