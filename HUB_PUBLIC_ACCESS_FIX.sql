-- Fix for Public Hub Data Display Issue
-- This script modifies RLS policies to allow public (anonymous) SELECT access
-- to hub tables, while keeping write operations restricted to authenticated users.

-- The issue: The public hub page (app/hub/page.tsx) uses the anon client to fetch data,
-- but the RLS policies only allow authenticated users to view data.
-- Since the hub is meant to be publicly accessible, we need to allow anonymous SELECT.

-- Drop existing SELECT policies and recreate them to allow public access

-- Programs: Allow anyone to view programs
DROP POLICY IF EXISTS "Allow authenticated users to view programs" ON hub_programs;
CREATE POLICY "Allow public to view programs" ON hub_programs
    FOR SELECT 
    USING (true);

-- Keep write operations restricted to authenticated users
DROP POLICY IF EXISTS "Allow authenticated users to insert programs" ON hub_programs;
CREATE POLICY "Allow authenticated users to insert programs" ON hub_programs
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to update programs" ON hub_programs;
CREATE POLICY "Allow authenticated users to update programs" ON hub_programs
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete programs" ON hub_programs;
CREATE POLICY "Allow authenticated users to delete programs" ON hub_programs
    FOR DELETE USING (auth.role() = 'authenticated');


-- Announcements: Allow anyone to view announcements
DROP POLICY IF EXISTS "Allow authenticated users to view announcements" ON hub_announcements;
CREATE POLICY "Allow public to view announcements" ON hub_announcements
    FOR SELECT 
    USING (true);

-- Keep write operations restricted to authenticated users
DROP POLICY IF EXISTS "Allow authenticated users to insert announcements" ON hub_announcements;
CREATE POLICY "Allow authenticated users to insert announcements" ON hub_announcements
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to update announcements" ON hub_announcements;
CREATE POLICY "Allow authenticated users to update announcements" ON hub_announcements
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete announcements" ON hub_announcements;
CREATE POLICY "Allow authenticated users to delete announcements" ON hub_announcements
    FOR DELETE USING (auth.role() = 'authenticated');


-- Market Prices: Allow anyone to view market prices
DROP POLICY IF EXISTS "Allow authenticated users to view market prices" ON hub_market_prices;
CREATE POLICY "Allow public to view market prices" ON hub_market_prices
    FOR SELECT 
    USING (true);

-- Keep write operations restricted to authenticated users
DROP POLICY IF EXISTS "Allow authenticated users to insert market prices" ON hub_market_prices;
CREATE POLICY "Allow authenticated users to insert market prices" ON hub_market_prices
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to update market prices" ON hub_market_prices;
CREATE POLICY "Allow authenticated users to update market prices" ON hub_market_prices
    FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow authenticated users to delete market prices" ON hub_market_prices;
CREATE POLICY "Allow authenticated users to delete market prices" ON hub_market_prices
    FOR DELETE USING (auth.role() = 'authenticated');

-- Summary of changes:
-- - SELECT: Now allows public (anonymous) access - data is visible to everyone
-- - INSERT/UPDATE/DELETE: Still restricted to authenticated users only
-- 
-- This is appropriate for a public transparency hub where:
-- - Anyone can view the data (fishermen, public, stakeholders)
-- - Only authorized staff (authenticated users) can manage the content