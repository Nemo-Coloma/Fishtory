-- Staff Profiles Table Fix: Add first_name and last_name columns
-- Run this in Supabase SQL Editor

-- Step 1: Add first_name and last_name columns if they don't exist
DO $$
BEGIN
    -- Add first_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_profiles' AND column_name = 'first_name') THEN
        ALTER TABLE staff_profiles ADD COLUMN first_name TEXT;
    END IF;
    
    -- Add last_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_profiles' AND column_name = 'last_name') THEN
        ALTER TABLE staff_profiles ADD COLUMN last_name TEXT;
    END IF;
END $$;

-- Step 2: Migrate data from full_name to first_name/last_name (if full_name exists)
DO $$
BEGIN
    -- Check if full_name column exists and migrate data
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_profiles' AND column_name = 'full_name') THEN
        -- Split full_name into first_name and last_name
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

-- Step 3: Drop full_name column if it exists (after migration)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'staff_profiles' AND column_name = 'full_name') THEN
        ALTER TABLE staff_profiles DROP COLUMN full_name;
    END IF;
END $$;

-- Step 4: Update RLS policies if needed
-- Ensure staff can view their own profiles
DROP POLICY IF EXISTS "Staff can view own profile" ON staff_profiles;
CREATE POLICY "Staff can view own profile" ON staff_profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Ensure admins can manage all staff profiles
DROP POLICY IF EXISTS "Admins can manage staff profiles" ON staff_profiles;
CREATE POLICY "Admins can manage staff profiles" ON staff_profiles
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.user_metadata->>'role' = 'admin'
        )
    );

-- Step 5: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_staff_profiles_user_id ON staff_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_profiles_staff_id ON staff_profiles(staff_id);

-- Step 6: Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'staff_profiles' 
ORDER BY ordinal_position;