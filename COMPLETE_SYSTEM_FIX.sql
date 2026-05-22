-- ============================================
-- COMPLETE SYSTEM FIX FOR FISHTORY
-- Run this ENTIRE script in Supabase SQL Editor
-- ============================================

-- ============================================
-- PART 1: Fix staff_profiles table structure
-- ============================================

-- Add first_name and last_name columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_profiles' AND column_name = 'first_name') THEN
        ALTER TABLE staff_profiles ADD COLUMN first_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_profiles' AND column_name = 'last_name') THEN
        ALTER TABLE staff_profiles ADD COLUMN last_name TEXT;
    END IF;
END $$;

-- Migrate data from full_name to first_name/last_name
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_profiles' AND column_name = 'full_name') THEN
        UPDATE staff_profiles 
        SET 
            first_name = CASE 
                WHEN full_name IS NOT NULL AND POSITION(' ' IN full_name) > 0 
                THEN SUBSTRING(full_name FROM 1 FOR POSITION(' ' IN full_name) - 1)
                ELSE full_name
            END,
            last_name = CASE 
                WHEN full_name IS NOT NULL AND POSITION(' ' IN full_name) > 0 
                THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
                ELSE NULL
            END
        WHERE first_name IS NULL AND last_name IS NULL AND full_name IS NOT NULL;
    END IF;
END $$;

-- Drop full_name column if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_profiles' AND column_name = 'full_name') THEN
        ALTER TABLE staff_profiles DROP COLUMN full_name;
    END IF;
END $$;

-- ============================================
-- PART 2: Fix RLS Policies (Remove Infinite Recursion)
-- ============================================

-- Drop ALL existing policies on staff_profiles (comprehensive list)
DROP POLICY IF EXISTS "Staff can view own profile" ON staff_profiles;
DROP POLICY IF EXISTS "Admins can manage staff profiles" ON staff_profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON staff_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON staff_profiles;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON staff_profiles;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON staff_profiles;
DROP POLICY IF EXISTS "staff_read_own" ON staff_profiles;
DROP POLICY IF EXISTS "admin_full_access" ON staff_profiles;
DROP POLICY IF EXISTS "admin_insert_staff" ON staff_profiles;
DROP POLICY IF EXISTS "staff_read_own_profile" ON staff_profiles;
DROP POLICY IF EXISTS "admin_manage_staff" ON staff_profiles;

-- Create NEW simple policies (no recursion)
-- Policy 1: Staff can read their own profile
CREATE POLICY "staff_read_own_profile" ON staff_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy 2: Admins have full access (check role in auth.users metadata)
CREATE POLICY "admin_manage_staff" ON staff_profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 
            FROM auth.users 
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM auth.users 
            WHERE id = auth.uid()
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- ============================================
-- PART 3: Create Lookup Tables if they don't exist
-- ============================================

-- Fish Species table
CREATE TABLE IF NOT EXISTS fish_species (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_tl TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processing Methods table
CREATE TABLE IF NOT EXISTS processing_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_tl TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Landing Centers table
CREATE TABLE IF NOT EXISTS landing_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PART 4: Seed Lookup Tables with Data
-- ============================================

-- Insert fish species (skip if already exists)
INSERT INTO fish_species (name_en, name_tl) VALUES
    ('Milkfish', 'Bangus'),
    ('Tilapia', 'Tilapia'),
    ('Tuna', 'Tuna'),
    ('Mackerel', 'Alumahan'),
    ('Sardines', 'Sardinas'),
    ('Catfish', 'Hito'),
    ('Carp', 'Karpa'),
    ('Snapper', 'Maya-maya'),
    ('Grouper', 'Lapu-lapu'),
    ('Sea Bass', 'Apahap'),
    ('Anchovy', 'Dilis'),
    ('Shrimp', 'Hipon'),
    ('Crab', 'Alimango')
ON CONFLICT DO NOTHING;

-- Insert processing methods
INSERT INTO processing_methods (name_en, name_tl) VALUES
    ('Fresh', 'Sariwa'),
    ('Smoked', 'Inihaw'),
    ('Dried', 'Tuyo'),
    ('Salted', 'Inasinan'),
    ('Frozen', 'Na-freeze'),
    ('Fermented', 'Bagoong')
ON CONFLICT DO NOTHING;

-- Insert landing centers (example locations - customize as needed)
INSERT INTO landing_centers (name, location) VALUES
    ('Banicain', 'Banicain Port'),
    ('Barretto', 'Barretto Bay'),
    ('Poblacion', 'Town Center'),
    ('San Jose', 'San Jose Coast'),
    ('Santa Cruz', 'Santa Cruz Pier'),
    ('San Miguel', 'San Miguel Beach'),
    ('San Antonio', 'San Antonio Harbor')
ON CONFLICT DO NOTHING;

-- ============================================
-- PART 5: Fix fisherman_registration table
-- ============================================

-- Add missing columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fisherman_registration' AND column_name = 'total_boats_operated') THEN
        ALTER TABLE fisherman_registration ADD COLUMN total_boats_operated INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fisherman_registration' AND column_name = 'total_crew') THEN
        ALTER TABLE fisherman_registration ADD COLUMN total_crew INTEGER DEFAULT 1;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fisherman_registration' AND column_name = 'lean_months') THEN
        ALTER TABLE fisherman_registration ADD COLUMN lean_months TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fisherman_registration' AND column_name = 'lean_daily_avg_catch') THEN
        ALTER TABLE fisherman_registration ADD COLUMN lean_daily_avg_catch NUMERIC DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fisherman_registration' AND column_name = 'peak_months') THEN
        ALTER TABLE fisherman_registration ADD COLUMN peak_months TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fisherman_registration' AND column_name = 'peak_daily_avg_catch') THEN
        ALTER TABLE fisherman_registration ADD COLUMN peak_daily_avg_catch NUMERIC DEFAULT 0;
    END IF;
END $$;

-- ============================================
-- PART 6: Create Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_staff_profiles_user_id ON staff_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_staff_id ON staff_profiles(staff_id);
CREATE INDEX IF NOT EXISTS idx_fisherman_registration_user_id ON fisherman_registration(user_id);
CREATE INDEX IF NOT EXISTS idx_fisherman_registration_fisherman_id ON fisherman_registration(fisherman_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at);

-- ============================================
-- PART 7: Verify Everything
-- ============================================

-- Show all tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Show staff_profiles columns
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'staff_profiles' ORDER BY ordinal_position;

-- Show policies on staff_profiles
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'staff_profiles';

-- Count records in lookup tables
SELECT 'fish_species' as table_name, COUNT(*) as record_count FROM fish_species
UNION ALL
SELECT 'processing_methods', COUNT(*) FROM processing_methods
UNION ALL
SELECT 'landing_centers', COUNT(*) FROM landing_centers;