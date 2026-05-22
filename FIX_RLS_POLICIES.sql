-- Fix infinite recursion in RLS policies for staff_profiles
-- Run this in Supabase SQL Editor

-- First, let's drop all existing policies on staff_profiles to start fresh
DROP POLICY IF EXISTS "Staff can view own profile" ON staff_profiles;
DROP POLICY IF EXISTS "Admins can manage staff profiles" ON staff_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON staff_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON staff_profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON staff_profiles;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON staff_profiles;

-- Create simple, non-recursive policies

-- 1. Allow authenticated users to read their own profile
CREATE POLICY "staff_read_own" ON staff_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- 2. Allow admins to do everything with staff profiles
CREATE POLICY "admin_full_access" ON staff_profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.user_metadata->>'role') = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.user_metadata->>'role') = 'admin'
        )
    );

-- 3. Allow staff creation (insert) for admins only
CREATE POLICY "admin_insert_staff" ON staff_profiles
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND (auth.users.user_metadata->>'role') = 'admin'
        )
    );

-- Verify policies were created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'staff_profiles'
ORDER BY policyname;