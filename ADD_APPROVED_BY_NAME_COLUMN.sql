-- Add approved_by_name column to reports table
-- This column stores the display name of the admin/staff who approved the report

ALTER TABLE reports
ADD COLUMN IF NOT EXISTS approved_by_name TEXT;

-- Add approved_at column to track when the approval happened (optional but useful)
ALTER TABLE reports
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Set approved_at when status changes to 'approved'
-- This is handled in the application code, but we can also add a trigger if needed

-- Comment the columns for documentation
COMMENT ON COLUMN reports.approved_by_name IS 'Display name of the admin/staff who approved this report';
COMMENT ON COLUMN reports.approved_at IS 'Timestamp when the report was approved';