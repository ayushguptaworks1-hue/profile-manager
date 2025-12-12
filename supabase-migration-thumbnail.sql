-- Add thumbnail_url column to profiles table
-- Run this in your Supabase SQL Editor

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Add a comment to the column
COMMENT ON COLUMN profiles.thumbnail_url IS 'Optional thumbnail image URL for video profiles';
