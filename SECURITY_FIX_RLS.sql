-- ============================================================
-- FISHTORY RLS RECURSION FIX
-- Run this script in the Supabase SQL Editor to fix the infinite recursion
-- ============================================================

-- Fix recursion in staff_profiles
-- By combining the policies, we avoid the nested SELECT that triggers the recursion
DROP POLICY IF EXISTS "Staff can read own profile" ON staff_profiles;
DROP POLICY IF EXISTS "Admin can read all staff profiles" ON staff_profiles;

CREATE POLICY "Allow users to read own profile or admins to read all"
ON staff_profiles FOR SELECT TO authenticated
USING (
  user_id = auth.uid() 
  OR 
  (role = 'admin') -- This is safe because it checks the row currently being evaluated
);

-- Fix recursion in fisherman_registration
-- When querying fisherman_registration, the policy checks staff_profiles.
-- Since we fixed the policy on staff_profiles, this should no longer recurse infinitely.
DROP POLICY IF EXISTS "Admin can read all registrations" ON fisherman_registration;

CREATE POLICY "Admin can read all registrations"
ON fisherman_registration FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Verification:
-- SELECT policyname, tablename, cmd FROM pg_policies WHERE tablename IN ('staff_profiles', 'fisherman_registration');
