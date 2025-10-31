-- Add has_completed_onboarding column to teachers table
-- This column tracks whether a teacher has completed the initial onboarding flow

ALTER TABLE teachers
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT FALSE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_teachers_onboarding ON teachers(has_completed_onboarding);

-- Update existing teachers to have onboarding completed (so they don't get redirected)
UPDATE teachers
SET has_completed_onboarding = TRUE
WHERE has_completed_onboarding IS NULL OR has_completed_onboarding = FALSE;
