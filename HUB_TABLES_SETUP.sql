-- Public Hub Tables Setup
-- This script creates all necessary tables for the Public Transparency Hub

-- 1. Hub Programs Table
CREATE TABLE IF NOT EXISTS hub_programs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'ongoing' CHECK (status IN ('ongoing', 'completed')),
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Hub Announcements Table
CREATE TABLE IF NOT EXISTS hub_announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_date DATE,
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'order', 'weather')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Hub Market Prices Table
CREATE TABLE IF NOT EXISTS hub_market_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    species TEXT NOT NULL UNIQUE,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    trend TEXT NOT NULL DEFAULT 'stable' CHECK (trend IN ('stable', 'up', 'down')),
    change_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE hub_programs IS 'Programs and projects for the public transparency hub';
COMMENT ON TABLE hub_announcements IS 'Announcements and advisories for the public transparency hub';
COMMENT ON TABLE hub_market_prices IS 'Market price monitoring data for the public transparency hub';

-- Enable Row Level Security (optional but recommended)
ALTER TABLE hub_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_market_prices ENABLE ROW LEVEL SECURITY;

-- Create policies to allow authenticated users to perform CRUD operations
-- Programs policies
CREATE POLICY "Allow authenticated users to view programs" ON hub_programs
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert programs" ON hub_programs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update programs" ON hub_programs
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete programs" ON hub_programs
    FOR DELETE USING (auth.role() = 'authenticated');

-- Announcements policies
CREATE POLICY "Allow authenticated users to view announcements" ON hub_announcements
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert announcements" ON hub_announcements
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update announcements" ON hub_announcements
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete announcements" ON hub_announcements
    FOR DELETE USING (auth.role() = 'authenticated');

-- Market Prices policies
CREATE POLICY "Allow authenticated users to view market prices" ON hub_market_prices
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert market prices" ON hub_market_prices
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update market prices" ON hub_market_prices
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete market prices" ON hub_market_prices
    FOR DELETE USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hub_programs_status ON hub_programs(status);
CREATE INDEX IF NOT EXISTS idx_hub_programs_created_at ON hub_programs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hub_announcements_category ON hub_announcements(category);
CREATE INDEX IF NOT EXISTS idx_hub_announcements_created_at ON hub_announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hub_announcements_event_date ON hub_announcements(event_date);
CREATE INDEX IF NOT EXISTS idx_hub_market_prices_species ON hub_market_prices(species);