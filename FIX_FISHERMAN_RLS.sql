-- ============================================
-- FIX FISHERMAN_REGISTRATION RLS POLICIES
-- This will allow admin to view all fishermen
-- ============================================

-- First, check current policies on fisherman_registration
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'fisherman_registration';

-- Drop ALL existing policies on fisherman_registration
DROP POLICY IF EXISTS "Enable read access for all users" ON fisherman_registration;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON fisherman_registration;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON fisherman_registration;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON fisherman_registration;
DROP POLICY IF EXISTS "Admins can manage fishermen" ON fisherman_registration;
DROP POLICY IF EXISTS "Staff can view fishermen" ON fisherman_registration;
DROP POLICY IF EXISTS "Fishermen can view own data" ON fisherman_registration;

-- Create simple, non-recursive policies

-- Policy 1: Allow authenticated admins to do everything
CREATE POLICY "admin_full_access_fishermen" ON fisherman_registration
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users u
            WHERE u.id = auth.uid()
            AND (u.raw_user_meta_data->>'role') = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users u
            WHERE u.id = auth.uid()
            AND (u.raw_user_meta_data->>'role') = 'admin'
        )
    );

-- Policy 2: Allow staff to read fishermen data
CREATE POLICY "staff_read_fishermen" ON fisherman_registration
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM auth.users u
            WHERE u.id = auth.uid()
            AND (u.raw_user_meta_data->>'role')::text IN ('admin', 'staff')
        )
    );

-- Policy 3: Allow fishermen to read their own data
CREATE POLICY "fishermen_read_own" ON fisherman_registration
    FOR SELECT
    USING (
        auth.uid() = user_id
    );

-- Verify the new policies
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'fisherman_registration' ORDER BY policyname;