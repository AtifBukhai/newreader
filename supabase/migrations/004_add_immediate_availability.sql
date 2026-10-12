-- Kitabo Database Migration: Add Immediate Availability Statuses
-- This migration adds 'processing' and 'available' statuses to support
-- immediate courseware availability after upload without mandatory review.

-- Add new status values to upload_status enum
ALTER TYPE upload_status ADD VALUE 'processing';
ALTER TYPE upload_status ADD VALUE 'available';

-- Update existing records that are in 'awaiting_review' to 'available'
-- This removes the mandatory review bottleneck for already uploaded files
UPDATE courseware 
SET status = 'available' 
WHERE status = 'awaiting_review';

-- Add index for faster library queries by status
CREATE INDEX IF NOT EXISTS idx_courseware_status_available 
ON courseware(status) 
WHERE status IN ('available', 'processing', 'published');

-- Add comment to document the new workflow
COMMENT ON TYPE upload_status IS 'Upload lifecycle: processing (metadata extraction in progress), available (immediately visible in admin library), published (available to students)';
