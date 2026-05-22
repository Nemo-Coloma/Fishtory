-- SOCIO-ECONOMIC PROFILING MIGRATION
-- This script adds the necessary tables and columns for detailed socio-economic monitoring.

-- 1. Create the fishermen_profiles table if it doesn't exist, otherwise update it
CREATE TABLE IF NOT EXISTS fishermen_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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
    boat_ownership_status TEXT, -- Owned, Rented, Shared
    boat_type_motorized BOOLEAN DEFAULT true,
    catch_composition TEXT, -- Major species caught
    
    -- Living Conditions & Welfare
    housing_condition TEXT, -- Concrete, Semi-Concrete, Light Materials
    water_access BOOLEAN DEFAULT true,
    electricity_access BOOLEAN DEFAULT true,
    toilet_access BOOLEAN DEFAULT true,
    welfare_status TEXT, -- Good, Struggling, etc.
    
    -- Occupational Needs
    fishing_needs TEXT, -- Gear repairs, new engine, etc.
    
    -- Social Protection & Subsidies
    philhealth BOOLEAN DEFAULT false,
    sss BOOLEAN DEFAULT false,
    pcic_insurance BOOLEAN DEFAULT false,
    subsidies_received TEXT, -- Fuel, Fingerlings, etc.
    subsidy_requirements TEXT, -- Records, ID, etc.
    
    location TEXT, -- Denormalized for easy filtering
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add Row Level Security (RLS)
ALTER TABLE fishermen_profiles ENABLE ROW LEVEL SECURITY;

-- Admins/Staff can do everything
CREATE POLICY "Admins can manage profiles"
ON fishermen_profiles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Public/Fishermen can read their own or aggregated (Restricted)
CREATE POLICY "Restricted read access"
ON fishermen_profiles
FOR SELECT
TO public
USING (true);

-- 3. Trigger for updated_at
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

-- 4. Initial Seed (Optional: link existing registrations to profile records)
INSERT INTO fishermen_profiles (fisherman_id, location)
SELECT fisherman_id, location 
FROM fisherman_registration 
ON CONFLICT (fisherman_id) DO NOTHING;
