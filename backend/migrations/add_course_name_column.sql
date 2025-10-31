-- Add course_name column to teachers table
-- This column stores the teacher's course name for display in the dashboard

ALTER TABLE teachers
ADD COLUMN IF NOT EXISTS course_name TEXT;
