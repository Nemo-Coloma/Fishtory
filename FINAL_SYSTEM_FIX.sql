-- ============================================================
-- FISHTORY FINAL SYSTEM FIX
-- Run this in Supabase SQL Editor to fix all issues
-- ============================================================

-- 1. CREATE MISSING LOOKUP TABLES
CREATE TABLE IF NOT EXISTS fish_species (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_tl TEXT,
    category TEXT DEFAULT 'coastal',
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fishing_gears (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_tl TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fishing_vessels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_tl TEXT,
    motorized BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS landing_centers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT,
    municipality TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS processing_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en TEXT NOT NULL,
    name_tl TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ENABLE RLS
ALTER TABLE fish_species ENABLE ROW LEVEL SECURITY;
ALTER TABLE fishing_gears ENABLE ROW LEVEL SECURITY;
ALTER TABLE fishing_vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_methods ENABLE ROW LEVEL SECURITY;

-- 3. CREATE POLICIES
CREATE POLICY "Public read access on fish_species" ON fish_species FOR SELECT USING (true);
CREATE POLICY "Public read access on fishing_gears" ON fishing_gears FOR SELECT USING (true);
CREATE POLICY "Public read access on fishing_vessels" ON fishing_vessels FOR SELECT USING (true);
CREATE POLICY "Public read access on landing_centers" ON landing_centers FOR SELECT USING (true);
CREATE POLICY "Public read access on processing_methods" ON processing_methods FOR SELECT USING (true);

-- 4. SEED DATA
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

INSERT INTO fishing_gears (name_en, name_tl, description) VALUES
('Gill Net', 'Pantukos', 'Net that catches fish by gills'),
('Trap', 'Bubo', 'Fish trap made of bamboo'),
('Hook and Line', 'Pancing', 'Traditional fishing line with hooks'),
('Seine Net', 'Pukot', 'Large net pulled by boats'),
('Cast Net', 'Panambal', 'Circular net thrown by hand'),
('Trawl Net', 'Pukot hila', 'Net dragged along seabed'),
('Fish Corral', 'Baklad', 'Stationary fish trap')
ON CONFLICT DO NOTHING;

INSERT INTO fishing_vessels (name_en, name_tl, motorized) VALUES
('Motorized Boat', 'Bangka na may makina', true),
('Non-Motorized Boat', 'Bangka na walang makina', false),
('Large Fishing Vessel', 'Malaking barko', true),
('Raft', 'Balsa', false),
('Canoe', 'Dugout', false)
ON CONFLICT DO NOTHING;

INSERT INTO landing_centers (name, location, municipality) VALUES
('Banicain Port', 'Banicain', 'Olongapo City'),
('Barretto Port', 'Barretto', 'Olongapo City'),
('Kalaklan Port', 'Kalaklan', 'Olongapo City'),
('Olongapo City Fish Port', 'East Tapinac', 'Olongapo City'),
('Subic Port', 'Barretto', 'Subic'),
('Mariveles Port', 'Poblacion', 'Mariveles'),
('Bataan Fishing Port', 'Orani', 'Bataan')
ON CONFLICT DO NOTHING;

INSERT INTO processing_methods (name_en, name_tl, description) VALUES
('Fresh', 'Sariwa', 'Caught and kept fresh'),
('Smoked', 'Tinapa', 'Heat-cured fish'),
('Dried', 'Tuyo', 'Sun-dried fish'),
('Salted', 'Daing', 'Salt-cured fish'),
('Canned', 'Sardinas', 'Processed and canned'),
('Frozen', 'Naka-freeze', 'Kept frozen')
ON CONFLICT DO NOTHING;

-- 5. ADD MISSING COLUMNS TO EXISTING TABLES
ALTER TABLE fisherman_registration 
ADD COLUMN IF NOT EXISTS fishing_gear TEXT,
ADD COLUMN IF NOT EXISTS vessel_type TEXT,
ADD COLUMN IF NOT EXISTS lean_months TEXT,
ADD COLUMN IF NOT EXISTS lean_daily_avg_catch NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS peak_months TEXT,
ADD COLUMN IF NOT EXISTS peak_daily_avg_catch NUMERIC DEFAULT 0;

-- Add ID columns to reports for database integrity
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS species_id UUID REFERENCES fish_species(id),
ADD COLUMN IF NOT EXISTS processing_method_id UUID REFERENCES processing_methods(id),
ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES landing_centers(id),
ADD COLUMN IF NOT EXISTS fishing_gear TEXT,
ADD COLUMN IF NOT EXISTS vessel_type TEXT;

-- 6. CREATE STAFF USER (if not exists)
-- This creates a default staff account: staff01@app.com / Staff@123
DO $$
BEGIN
  -- Check if staff user exists
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'staff01@app.com'
  ) THEN
    -- Create staff user
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, 
      encrypted_password, email_confirmed_at, 
      recovery_sent_at, last_sign_in_at,
      raw_app_meta_data, raw_user_meta_data, 
      created_at, updated_at, confirmation_token, 
      email_change, email_change_token, 
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'staff01@app.com',
      crypt('Staff@123', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"email":"staff01@app.com","email_verified":true,"full_name":"Staff Admin","role":"staff","staff_id":"STAFF-01"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    );
  END IF;
END $$;

-- 7. CREATE STAFF PROFILE
INSERT INTO staff_profiles (user_id, staff_id, full_name, role, email)
SELECT 
  u.id,
  'STAFF-01',
  'Staff Admin',
  'admin',
  'staff01@app.com'
FROM auth.users u
WHERE u.email = 'staff01@app.com'
AND NOT EXISTS (
  SELECT 1 FROM staff_profiles WHERE email = 'staff01@app.com'
);

-- 8. ENSURE STAFF_PROFILES TABLE EXISTS
CREATE TABLE IF NOT EXISTS staff_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  staff_id TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'staff',
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read own profile" ON staff_profiles 
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admin can read all staff profiles" ON staff_profiles 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM staff_profiles sp 
    WHERE sp.user_id = auth.uid() AND sp.role = 'admin'
  )
);

-- 9. UPDATE REPORTS TABLE TO ENSURE ALL COLUMNS EXIST
ALTER TABLE reports 
ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES auth.users(id);

-- ============================================================
-- DONE! Run this script in Supabase SQL Editor
-- After running, you can login with:
-- Email: staff01@app.com
-- Password: Staff@123
-- ============================================================