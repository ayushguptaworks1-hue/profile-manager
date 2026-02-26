-- Migration: Replace 'availability' column with 'hours_per_week' and 'transition_time'
-- Run this in your Supabase SQL Editor

-- Add new columns
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS hours_per_week TEXT DEFAULT 'Available 40 hrs/week';

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS transition_time TEXT DEFAULT 'Immediate';

-- Add comments
COMMENT ON COLUMN profiles.hours_per_week IS 'Availability hours: Available 20 hrs/week, Available 40 hrs/week, Not Available';
COMMENT ON COLUMN profiles.transition_time IS 'Transition time: Immediate, 15 days, 30 days, 45 days, 60 days';

-- Optionally drop the old availability column (uncomment when ready)
-- ALTER TABLE profiles DROP COLUMN IF EXISTS availability;
