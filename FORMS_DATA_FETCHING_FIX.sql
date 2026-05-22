-- ============================================================
-- FISHTORY FORMS DATA FETCHING FIX
-- This script creates missing lookup tables and seed data
-- Run this in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- SECTION 1: Create Missing Lookup Tables
-- ============================================================

-- 1a. Fish Species Table
CREATE TABLE IF NOT EXISTS fish_species (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_tl TEXT,
    category TEXT DEFAULT 'coastal', -- coastal, small, deep_sea, specialty
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 1b. Fishing Gears Table
CREATE TABLE IF NOT EXISTS fishing_gears (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_tl TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 1c. Fishing Vessels Table
CREATE TABLE IF NOT EXISTS fishing_vessels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_tl TEXT,
    motorized BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 1d. Landing Centers Table
CREATE TABLE IF NOT EXISTS landing_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT,
    municipality TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 1e. Processing Methods Table
CREATE TABLE IF NOT EXISTS processing_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_tl TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- SECTION 2: Enable RLS on New Tables
-- ============================================================

ALTER TABLE fish_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE fishing_gears ENABLE ROW LEVEL SECURITY;
ALTER TABLE fishing_vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_methods ENABLE ROW LEVEL SECURITY;

-- Public read access for all lookup tables
CREATE POLICY "Public read access on fish_species" ON fish_species FOR SELECT USING (true);
CREATE POLICY "Public read access on fishing_gears" ON fishing_gears FOR SELECT USING (true);
CREATE POLICY "Public read access on fishing_vessels" ON fishing_vessels FOR SELECT USING (true);
CREATE POLICY "Public read access on landing_centers" ON landing_centers FOR SELECT USING (true);
CREATE POLICY "Public read access on processing_methods" ON processing_methods FOR SELECT USING (true);

-- Admin write access (only admins can modify lookup tables)
CREATE POLICY "Admin write access on fish_species" ON fish_species FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin write access on fishing_gears" ON fishing_gears FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin write access on fishing_vessels" ON fishing_vessels FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin write access on landing_centers" ON landing_centers FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin write access on processing_methods" ON processing_methods FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- ============================================================
-- SECTION 3: Seed Initial Data
-- ============================================================

-- 3a. Fish Species
INSERT INTO fish_species (name_en, name_tl, category) VALUES
('Milkfish', 'Bangus', 'coastal'),
('Tilapia', 'Tilapia', 'coastal'),
('Grouper', 'Lapu-lapu', 'coastal'),
('Anchovies', 'Dilis', 'small'),
('Sardines', 'Sardinas', 'small'),
('Tuna', 'Tuna', 'deep_sea'),
('Bigeye Tuna', 'Taba', 'deep_sea'),
('Trevally', 'Bariles', 'deep_sea'),
('Rabbitfish', 'Malipong Bato', 'coastal'),
('Herring', 'Tamban', 'small'),
('Fusilier', 'Tunog', 'small'),
('Mackerel', 'Isda ng Bakal', 'deep_sea'),
('Pompano', 'Pampanito', 'specialty')
ON CONFLICT DO NOTHING;

-- 3b. Fishing Gears
INSERT INTO fishing_gears (name_en, name_tl, description) VALUES
('Gill Net', 'Pantukos', 'Net that catches fish by gills'),
('Trap', 'Bubo', 'Fish trap made of bamboo'),
('Hook and Line', 'Pancing', 'Traditional fishing line with hooks'),
('Seine Net', 'Pukot', 'Large net pulled by boats'),
('Cast Net', 'Panambal', 'Circular net thrown by hand'),
('Trawl Net', 'Pukot hila', 'Net dragged along seabed'),
('Fish Corral', 'Baklad', 'Stationary fish trap')
ON CONFLICT DO NOTHING;

-- 3c. Fishing Vessels
INSERT INTO fishing_vessels (name_en, name_tl, motorized) VALUES
('Motorized Boat', 'Bangka na may makina', true),
('Non-Motorized Boat', 'Bangka na walang makina', false),
('Large Fishing Vessel', 'Malaking barko', true),
('Raft', 'Balsa', false),
('Canoe', 'Dugout', false)
ON CONFLICT DO NOTHING;

-- 3d. Landing Centers (Olongapo area)
INSERT INTO landing_centers (name, location, municipality) VALUES
('Banicain Port', 'Banicain', 'Olongapo City'),
('Barretto Port', 'Barretto', 'Olongapo City'),
('Kalaklan Port', 'Kalaklan', 'Olongapo City'),
('Olongapo City Fish Port', 'East Tapinac', 'Olongapo City'),
('Subic Port', 'Barretto', 'Subic'),
('Mariveles Port', 'Poblacion', 'Mariveles'),
('Bataan Fishing Port', 'Orani', 'Bataan')
ON CONFLICT DO NOTHING;

-- 3e. Processing Methods
INSERT INTO processing_methods (name_en, name_tl, description) VALUES
('Fresh', 'Sariwa', 'Caught and kept fresh'),
('Smoked', 'Tinapa', 'Heat-cured fish'),
('Dried', 'Tuyo', 'Sun-dried fish'),
('Salted', 'Daing', 'Salt-cured fish'),
('Canned', 'Sardinas', 'Processed and canned'),
('Frozen', 'Naka-freeze', 'Kept frozen')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SECTION 4: Add Missing Columns to Existing Tables
-- ============================================================

-- Add columns to fisherman_registration if they don't exist
ALTER TABLE fisherman_registration 
ADD COLUMN IF NOT EXISTS fishing_gear TEXT,
ADD COLUMN IF NOT EXISTS vessel_type TEXT,
ADD COLUMN IF NOT EXISTS lean_months TEXT,
ADD COLUMN IF NOT EXISTS lean_daily_avg_catch NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS peak_months TEXT,
ADD COLUMN IF NOT EXISTS peak_daily_avg_catch NUMERIC DEFAULT 0;

-- Add columns to reports if they don't exist
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS fishing_gear TEXT,
ADD COLUMN IF NOT EXISTS vessel_type TEXT,
ADD COLUMN IF NOT EXISTS processing_method TEXT;

-- ============================================================
-- DONE! Run this script in Supabase SQL Editor
-- ============================================================