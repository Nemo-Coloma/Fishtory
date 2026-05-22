-- ============================================================
-- FISHTORY PUBLIC HUB MIGRATION
-- Run this in the Supabase SQL Editor
-- ============================================================

-- 1. Programs & Projects
CREATE TABLE IF NOT EXISTS hub_programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT DEFAULT 'ongoing', -- ongoing, completed
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Announcements & Trainings
CREATE TABLE IF NOT EXISTS hub_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    date_posted DATE DEFAULT CURRENT_DATE,
    event_date DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Success Stories
CREATE TABLE IF NOT EXISTS hub_stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    story TEXT,
    impact TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Extra Statistics (for non-automated data)
CREATE TABLE IF NOT EXISTS hub_extra_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    total_assistance INTEGER DEFAULT 0,
    total_trainings INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT now()
);

-- Insert initial record for extra stats if it doesn't exist
INSERT INTO hub_extra_stats (total_assistance, total_trainings)
SELECT 0, 0
WHERE NOT EXISTS (SELECT 1 FROM hub_extra_stats);

-- 5. Enable RLS
ALTER TABLE hub_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_extra_stats ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (Public Read Access)
CREATE POLICY "Public Read Programs" ON hub_programs FOR SELECT USING (true);
CREATE POLICY "Public Read Announcements" ON hub_announcements FOR SELECT USING (true);
CREATE POLICY "Public Read Stories" ON hub_stories FOR SELECT USING (true);
CREATE POLICY "Public Read Extra Stats" ON hub_extra_stats FOR SELECT USING (true);

-- 7. RLS Policies (Admin Write Access)
-- Assumes 'admin' role in staff_profiles as per SECURITY_MIGRATION.sql
CREATE POLICY "Admin Write Programs" ON hub_programs FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin Write Announcements" ON hub_announcements FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin Write Stories" ON hub_stories FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin Write Extra Stats" ON hub_extra_stats FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- 8. Market Prices
CREATE TABLE IF NOT EXISTS hub_market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    species TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    trend TEXT DEFAULT 'stable', -- up, down, stable
    change_text TEXT, -- e.g. "+₱5", "-₱10"
    last_updated TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Add category column to announcements
ALTER TABLE hub_announcements ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Enable RLS
ALTER TABLE hub_market_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Read Market Prices" ON hub_market_prices FOR SELECT USING (true);
CREATE POLICY "Admin Write Market Prices" ON hub_market_prices FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM staff_profiles WHERE user_id = auth.uid() AND role = 'admin'));
