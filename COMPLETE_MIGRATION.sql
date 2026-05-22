-- ============================================================
-- FISHTORY COMPLETE MIGRATION SCRIPT
-- Run this ENTIRE script in the Supabase SQL Editor.
-- It is safe to run multiple times (uses IF NOT EXISTS / IF EXISTS guards).
-- ============================================================

-- ============================================================
-- SECTION 1: SECURITY SETUP - submitted_by column for reports
-- ============================================================
ALTER TABLE reports ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
UPDATE reports SET submitted_by = user_id WHERE submitted_by IS NULL;

-- ============================================================
-- SECTION 2: Enable Row Level Security on base tables
-- ============================================================
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE fisherman_registration ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- SECTION 3: RLS Policies for `reports`
-- ============================================================
DROP POLICY IF EXISTS "Fishermen can read own reports" ON reports;
DROP POLICY IF EXISTS "Fishermen can insert own reports" ON reports;
DROP POLICY IF EXISTS "Staff can insert reports" ON reports;
DROP POLICY IF EXISTS "Staff can update own submitted reports" ON reports;
DROP POLICY IF EXISTS "Admin can read all reports" ON reports;
DROP POLICY IF EXISTS "Admin can update all reports" ON reports;
DROP POLICY IF EXISTS "Admin can delete reports" ON reports;

CREATE POLICY "Fishermen can read own reports"
ON reports FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Fishermen can insert own reports"
ON reports FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() AND submitted_by = auth.uid());

CREATE POLICY "Staff can insert reports"
ON reports FOR INSERT TO authenticated
WITH CHECK (
  submitted_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM staff_profiles sp
    WHERE sp.user_id = auth.uid() AND sp.role = 'staff'
  )
);

CREATE POLICY "Staff can update own submitted reports"
ON reports FOR UPDATE TO authenticated
USING (submitted_by = auth.uid())
WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Admin can read all reports"
ON reports FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_profiles sp
    WHERE sp.user_id = auth.uid() AND sp.role = 'admin'
  )
);

CREATE POLICY "Admin can update all reports"
ON reports FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_profiles sp
    WHERE sp.user_id = auth.uid() AND sp.role = 'admin'
  )
);

CREATE POLICY "Admin can delete reports"
ON reports FOR DELETE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_profiles sp
    WHERE sp.user_id = auth.uid() AND sp.role = 'admin'
  )
);

-- ============================================================
-- SECTION 4: RLS Policies for `fisherman_registration`
-- ============================================================
DROP POLICY IF EXISTS "Fishermen can read own registration" ON fisherman_registration;
DROP POLICY IF EXISTS "Staff can insert fisherman registration" ON fisherman_registration;
DROP POLICY IF EXISTS "Staff can read own created registrations" ON fisherman_registration;
DROP POLICY IF EXISTS "Staff can update own created registrations" ON fisherman_registration;
DROP POLICY IF EXISTS "Admin can read all registrations" ON fisherman_registration;

CREATE POLICY "Fishermen can read own registration"
ON fisherman_registration FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Staff can insert fisherman registration"
ON fisherman_registration FOR INSERT TO authenticated
WITH CHECK (
  created_by = auth.uid()
  AND EXISTS (
    SELECT 1 FROM staff_profiles sp
    WHERE sp.user_id = auth.uid() AND sp.role = 'staff'
  )
);

CREATE POLICY "Staff can read own created registrations"
ON fisherman_registration FOR SELECT TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "Staff can update own created registrations"
ON fisherman_registration FOR UPDATE TO authenticated
USING (created_by = auth.uid())
WITH CHECK (created_by = auth.uid());

-- ============================================================
-- SECTION 5: RLS Policies for `staff_profiles` (recursion-safe)
-- ============================================================
DROP POLICY IF EXISTS "Staff can read own profile" ON staff_profiles;
DROP POLICY IF EXISTS "Admin can read all staff profiles" ON staff_profiles;
DROP POLICY IF EXISTS "Allow users to read own profile or admins to read all" ON staff_profiles;

-- Safe policy: checks role on the row being evaluated (no nested SELECT)
CREATE POLICY "Allow users to read own profile or admins to read all"
ON staff_profiles FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR
  (role = 'admin')
);

-- Admin can read ALL registrations (uses the fixed staff_profiles policy)
CREATE POLICY "Admin can read all registrations"
ON fisherman_registration FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- ============================================================
-- SECTION 6: Socio-Economic Profiling Table
-- ============================================================
CREATE TABLE IF NOT EXISTS fishermen_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fisherman_id TEXT REFERENCES fisherman_registration(fisherman_id) ON DELETE CASCADE UNIQUE,
    
    -- Demographic Profile
    age INTEGER,
    gender TEXT,
    education_attainment TEXT,
    dependency_ratio DECIMAL(5,2),
    
    -- Economic Indicators
    monthly_income DECIMAL(12,2),
    poverty_status BOOLEAN DEFAULT false,
    secondary_livelihood TEXT,
    
    -- Occupational Profile
    fishing_gear TEXT,
    boat_ownership_status TEXT,
    boat_type_motorized BOOLEAN DEFAULT true,
    catch_composition TEXT,
    
    -- Living Conditions & Welfare
    housing_condition TEXT,
    water_access BOOLEAN DEFAULT true,
    electricity_access BOOLEAN DEFAULT true,
    toilet_access BOOLEAN DEFAULT true,
    welfare_status TEXT,
    
    -- Occupational Needs
    fishing_needs TEXT,
    
    -- Social Protection & Subsidies
    philhealth BOOLEAN DEFAULT false,
    sss BOOLEAN DEFAULT false,
    pcic_insurance BOOLEAN DEFAULT false,
    subsidies_received TEXT,
    subsidy_requirements TEXT,
    
    location TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE fishermen_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage profiles" ON fishermen_profiles;
DROP POLICY IF EXISTS "Restricted read access" ON fishermen_profiles;

CREATE POLICY "Admins can manage profiles"
ON fishermen_profiles FOR ALL TO authenticated
USING (true)
WITH CHECK (true);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_fishermen_profiles_updated_at ON fishermen_profiles;
CREATE TRIGGER update_fishermen_profiles_updated_at
    BEFORE UPDATE ON fishermen_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Seed initial profile stubs from existing registrations
INSERT INTO fishermen_profiles (fisherman_id, location)
SELECT fisherman_id, location 
FROM fisherman_registration 
ON CONFLICT (fisherman_id) DO NOTHING;

-- ============================================================
-- SECTION 7: Public Hub Tables
-- ============================================================

-- 7a. Programs & Projects
CREATE TABLE IF NOT EXISTS hub_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'ongoing',
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7b. Announcements & Trainings
CREATE TABLE IF NOT EXISTS hub_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    date_posted DATE DEFAULT CURRENT_DATE,
    event_date DATE,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7c. Success Stories
CREATE TABLE IF NOT EXISTS hub_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    story TEXT,
    impact TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 7d. Extra Statistics
CREATE TABLE IF NOT EXISTS hub_extra_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_assistance INTEGER DEFAULT 0,
    total_trainings INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT now()
);

INSERT INTO hub_extra_stats (total_assistance, total_trainings)
SELECT 0, 0
WHERE NOT EXISTS (SELECT 1 FROM hub_extra_stats);

-- 7e. Market Prices
CREATE TABLE IF NOT EXISTS hub_market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    species TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    trend TEXT DEFAULT 'stable',
    change_text TEXT,
    last_updated TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 8: RLS for Hub Tables
-- ============================================================
ALTER TABLE hub_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_extra_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_market_prices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Programs" ON hub_programs;
DROP POLICY IF EXISTS "Public Read Announcements" ON hub_announcements;
DROP POLICY IF EXISTS "Public Read Stories" ON hub_stories;
DROP POLICY IF EXISTS "Public Read Extra Stats" ON hub_extra_stats;
DROP POLICY IF EXISTS "Public Read Market Prices" ON hub_market_prices;
DROP POLICY IF EXISTS "Admin Write Programs" ON hub_programs;
DROP POLICY IF EXISTS "Admin Write Announcements" ON hub_announcements;
DROP POLICY IF EXISTS "Admin Write Stories" ON hub_stories;
DROP POLICY IF EXISTS "Admin Write Extra Stats" ON hub_extra_stats;
DROP POLICY IF EXISTS "Admin Write Market Prices" ON hub_market_prices;

CREATE POLICY "Public Read Programs" ON hub_programs FOR SELECT USING (true);
CREATE POLICY "Public Read Announcements" ON hub_announcements FOR SELECT USING (true);
CREATE POLICY "Public Read Stories" ON hub_stories FOR SELECT USING (true);
CREATE POLICY "Public Read Extra Stats" ON hub_extra_stats FOR SELECT USING (true);
CREATE POLICY "Public Read Market Prices" ON hub_market_prices FOR SELECT USING (true);

CREATE POLICY "Admin Write Programs" ON hub_programs FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin Write Announcements" ON hub_announcements FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin Write Stories" ON hub_stories FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin Write Extra Stats" ON hub_extra_stats FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin Write Market Prices" ON hub_market_prices FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- ============================================================
-- DONE! After running this script, execute scripts/setup-db.mjs
-- to seed staff profiles and demo data.
-- ============================================================
