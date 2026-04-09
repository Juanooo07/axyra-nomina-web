-- Add date and hour_type_name columns to hour_records table
ALTER TABLE hour_records
ADD COLUMN IF NOT EXISTS date date,
ADD COLUMN IF NOT EXISTS hour_type_name text;

-- Set default date to current date for existing records
UPDATE hour_records
SET date = CURRENT_DATE
WHERE date IS NULL;

-- Set hour_type_name from hour_types table for existing records
UPDATE hour_records hr
SET hour_type_name = ht.name
FROM hour_types ht
WHERE hr.hour_type_id = ht.id
AND hr.hour_type_name IS NULL;

-- Add NOT NULL constraints after populating data
ALTER TABLE hour_records
ALTER COLUMN date SET NOT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_hour_records_period ON hour_records(period);
CREATE INDEX IF NOT EXISTS idx_hour_records_date ON hour_records(date);
CREATE INDEX IF NOT EXISTS idx_hour_records_user_period ON hour_records(user_id, period);