# Hub Data Display Fix - Instructions

## Problem
Data saved in the **Announcement tab**, **Program tab**, and **Market tab** is not displaying in the public hub management page (`/hub`).

## Root Cause
The RLS (Row Level Security) policies on the hub tables (`hub_programs`, `hub_announcements`, `hub_market_prices`) only allow **authenticated users** to view data. However, the public hub page is meant to be accessible to everyone (including anonymous visitors), so the data fetch fails silently.

## Solution
Update the RLS policies to allow **public (anonymous) SELECT access** to these tables, while keeping write operations (INSERT/UPDATE/DELETE) restricted to authenticated users only.

## How to Apply the Fix

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard:**
   - URL: https://supabase.com/dashboard/project/gxqhdqampmfxuahiiign

2. **Navigate to SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "New query"

3. **Copy and paste the following SQL:**

```sql
-- Fix for Public Hub Data Display Issue
-- This script modifies RLS policies to allow public (anonymous) SELECT access
-- to hub tables, while keeping write operations restricted to authenticated users.

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
```

4. **Run the SQL:**
   - Click the "Run" button (or press Ctrl+Enter / Cmd+Enter)
   - You should see a success message

5. **Verify the fix:**
   - Refresh your public hub page (`/hub`)
   - The data from announcements, programs, and market tabs should now display correctly

### Option 2: Using the SQL File

The SQL script is already saved in `HUB_PUBLIC_ACCESS_FIX.sql`. You can:
1. Open the file in your text editor
2. Copy its contents
3. Paste into Supabase SQL Editor
4. Run the query

## What Changed

| Table | Before | After |
|-------|--------|-------|
| `hub_programs` | SELECT requires authentication | SELECT is public, WRITE requires authentication |
| `hub_announcements` | SELECT requires authentication | SELECT is public, WRITE requires authentication |
| `hub_market_prices` | SELECT requires authentication | SELECT is public, WRITE requires authentication |

## Security Note
This change is **safe** because:
- The hub data is meant for **public transparency** - anyone should be able to view it
- Only **authenticated users** (staff/admin) can still add, edit, or delete data
- This is the correct security model for a public information dashboard

## Verification
After applying the fix:
1. Visit `http://localhost:3000/hub` (or your deployed URL)
2. You should see:
   - Market prices in the "Market Watch" section
   - Announcements categorized by type (Admin Orders, Weather Alerts, General Advisory)
   - Programs in the "Ongoing Support & Initiatives" section

If data still doesn't appear, check:
1. Is there data in the tables? (Check via Supabase Table Editor)
2. Are there any console errors in the browser?
3. Try clearing the browser cache and refreshing