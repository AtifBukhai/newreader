-- Kitabo Database Migration: Courseware Management System
-- This migration adds support for bulk courseware upload, publisher management,
-- and comprehensive content lifecycle management.

-- ============================================
-- NEW ENUMS
-- ============================================
CREATE TYPE publisher_status AS ENUM ('active', 'inactive', 'suspended');
CREATE TYPE upload_status AS ENUM (
  'selected', 'uploading', 'uploaded', 'validating', 'validation_failed',
  'extracting_metadata', 'awaiting_review', 'ready_to_publish', 'published',
  'processing_failed', 'quarantined', 'archived'
);
CREATE TYPE file_format AS ENUM ('epub', 'pdf', 'unknown');
CREATE TYPE rights_status AS ENUM ('pending', 'approved', 'expired', 'rejected');

-- ============================================
-- PUBLISHERS
-- ============================================
CREATE TABLE publishers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  identifier TEXT UNIQUE, -- Publisher's internal identifier
  description TEXT,
  logo_url TEXT,
  website TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  status publisher_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_publishers_status ON publishers(status);
CREATE INDEX idx_publishers_name ON publishers(name);

-- ============================================
-- CATEGORIES & SUBJECTS
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- COURSEWARE (extends books table)
-- ============================================
CREATE TABLE courseware (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID REFERENCES books(id) ON DELETE CASCADE, -- Link to existing books table
  
  -- Publisher information
  publisher_id UUID REFERENCES publishers(id) ON DELETE SET NULL,
  
  -- File information
  file_format file_format NOT NULL,
  file_size BIGINT NOT NULL, -- in bytes
  file_hash TEXT NOT NULL, -- SHA-256 hash for duplicate detection
  storage_path TEXT NOT NULL, -- Private storage path
  original_filename TEXT NOT NULL,
  
  -- Metadata
  title TEXT NOT NULL,
  subtitle TEXT,
  author TEXT NOT NULL,
  isbn_10 TEXT,
  isbn_13 TEXT,
  edition TEXT,
  publication_year INTEGER,
  language TEXT NOT NULL DEFAULT 'English',
  description TEXT,
  page_count INTEGER,
  cover_url TEXT,
  
  -- Classification
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  course_name TEXT,
  certification TEXT,
  level TEXT, -- e.g., 'beginner', 'intermediate', 'advanced'
  tags TEXT[] NOT NULL DEFAULT '{}',
  
  -- Version management
  version TEXT NOT NULL DEFAULT '1.0.0',
  is_latest_version BOOLEAN NOT NULL DEFAULT true,
  previous_version_id UUID REFERENCES courseware(id) ON DELETE SET NULL,
  
  -- Status
  status upload_status NOT NULL DEFAULT 'selected',
  
  -- Rights and authorization
  rights_holder TEXT,
  license_reference TEXT,
  rights_status rights_status NOT NULL DEFAULT 'pending',
  rights_approved_by UUID REFERENCES profiles(id),
  rights_approved_at TIMESTAMPTZ,
  rights_expiry_date DATE,
  rights_notes TEXT,
  
  -- Processing
  uploaded_by UUID NOT NULL REFERENCES profiles(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  validated_at TIMESTAMPTZ,
  metadata_extracted_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES profiles(id),
  
  -- Metadata quality
  metadata_complete BOOLEAN NOT NULL DEFAULT false,
  metadata_review_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courseware_publisher ON courseware(publisher_id);
CREATE INDEX idx_courseware_status ON courseware(status);
CREATE INDEX idx_courseware_file_hash ON courseware(file_hash);
CREATE INDEX idx_courseware_isbn ON courseware(isbn_13);
CREATE INDEX idx_courseware_book ON courseware(book_id);
CREATE INDEX idx_courseware_rights_status ON courseware(rights_status);

-- ============================================
-- UPLOAD BATCHES
-- ============================================
CREATE TABLE upload_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  publisher_id UUID REFERENCES publishers(id) ON DELETE SET NULL,
  total_files INTEGER NOT NULL DEFAULT 0,
  successful_uploads INTEGER NOT NULL DEFAULT 0,
  failed_uploads INTEGER NOT NULL DEFAULT 0,
  status upload_status NOT NULL DEFAULT 'selected',
  initiated_by UUID NOT NULL REFERENCES profiles(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_report_url TEXT, -- URL to download error report
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_upload_batches_status ON upload_batches(status);
CREATE INDEX idx_upload_batches_publisher ON upload_batches(publisher_id);

-- ============================================
-- UPLOAD JOBS (for background processing)
-- ============================================
CREATE TABLE upload_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES upload_batches(id) ON DELETE CASCADE,
  courseware_id UUID REFERENCES courseware(id) ON DELETE CASCADE,
  
  -- Job tracking
  status upload_status NOT NULL DEFAULT 'selected',
  progress INTEGER NOT NULL DEFAULT 0, -- 0-100
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 3,
  
  -- File information
  original_filename TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_format file_format,
  
  -- Processing results
  validation_result JSONB, -- Store validation details
  metadata_result JSONB, -- Store extracted metadata
  error_message TEXT,
  error_details JSONB,
  
  -- Timestamps
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_upload_jobs_batch ON upload_jobs(batch_id);
CREATE INDEX idx_upload_jobs_status ON upload_jobs(status);
CREATE INDEX idx_upload_jobs_courseware ON upload_jobs(courseware_id);

-- ============================================
-- PUBLISHER RIGHTS & AUTHORIZATION
-- ============================================
CREATE TABLE publisher_rights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id UUID NOT NULL REFERENCES publishers(id) ON DELETE CASCADE,
  courseware_id UUID REFERENCES courseware(id) ON DELETE CASCADE,
  
  -- Authorization details
  rights_holder TEXT NOT NULL,
  license_type TEXT, -- e.g., 'exclusive', 'non-exclusive', 'public domain'
  license_reference TEXT,
  agreement_document_url TEXT,
  
  -- Scope
  distribution_scope TEXT, -- e.g., 'global', 'regional', 'specific partners'
  allowed_partners UUID[] DEFAULT '{}', -- If restricted to specific partners
  
  -- Duration
  start_date DATE NOT NULL,
  expiry_date DATE,
  is_perpetual BOOLEAN NOT NULL DEFAULT false,
  
  -- Status
  status rights_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  review_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_publisher_rights_publisher ON publisher_rights(publisher_id);
CREATE INDEX idx_publisher_rights_status ON publisher_rights(status);
CREATE INDEX idx_publisher_rights_expiry ON publisher_rights(expiry_date);

-- ============================================
-- COURSEWARE AUDIT LOG
-- ============================================
CREATE TABLE courseware_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  courseware_id UUID REFERENCES courseware(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES upload_batches(id) ON DELETE SET NULL,
  
  actor_id UUID NOT NULL REFERENCES profiles(id),
  action TEXT NOT NULL, -- e.g., 'uploaded', 'validated', 'metadata_extracted', 'published', 'archived'
  details JSONB, -- Store action-specific details
  previous_status upload_status,
  new_status upload_status,
  
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_courseware_audit_courseware ON courseware_audit_log(courseware_id);
CREATE INDEX idx_courseware_audit_actor ON courseware_audit_log(actor_id);
CREATE INDEX idx_courseware_audit_action ON courseware_audit_log(action);
CREATE INDEX idx_courseware_audit_created ON courseware_audit_log(created_at);

-- ============================================
-- DUPLICATE DETECTION LOG
-- ============================================
CREATE TABLE duplicate_detection_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  courseware_id UUID NOT NULL REFERENCES courseware(id) ON DELETE CASCADE,
  duplicate_of UUID REFERENCES courseware(id) ON DELETE SET NULL,
  
  detection_method TEXT NOT NULL, -- 'file_hash', 'isbn', 'title_edition'
  confidence TEXT NOT NULL, -- 'exact', 'high', 'medium', 'low'
  details JSONB,
  
  resolution TEXT, -- 'skipped', 'new_version', 'replaced', 'reviewed'
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_duplicate_detection_courseware ON duplicate_detection_log(courseware_id);
CREATE INDEX idx_duplicate_detection_method ON duplicate_detection_log(detection_method);

-- ============================================
-- EXTEND BOOKS TABLE
-- ============================================
-- Add publisher_id to books table for better integration
ALTER TABLE books ADD COLUMN IF NOT EXISTS publisher_id UUID REFERENCES publishers(id) ON DELETE SET NULL;
ALTER TABLE books ADD COLUMN IF NOT EXISTS file_hash TEXT;
ALTER TABLE books ADD COLUMN IF NOT EXISTS file_format file_format;
ALTER TABLE books ADD COLUMN IF NOT EXISTS courseware_id UUID REFERENCES courseware(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_books_publisher ON books(publisher_id);
CREATE INDEX IF NOT EXISTS idx_books_file_hash ON books(file_hash);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER trg_publishers_updated BEFORE UPDATE ON publishers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_courseware_updated BEFORE UPDATE ON courseware
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_upload_batches_updated BEFORE UPDATE ON upload_batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_upload_jobs_updated BEFORE UPDATE ON upload_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_publisher_rights_updated BEFORE UPDATE ON publisher_rights
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE publishers ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE courseware ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE upload_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE publisher_rights ENABLE ROW LEVEL SECURITY;
ALTER TABLE courseware_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE duplicate_detection_log ENABLE ROW LEVEL SECURITY;

-- Super admins can manage all courseware
CREATE POLICY super_admin_all_courseware ON courseware FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- Super admins can manage all publishers
CREATE POLICY super_admin_all_publishers ON publishers FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- Super admins can manage all upload batches
CREATE POLICY super_admin_all_batches ON upload_batches FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- Users can view published courseware
CREATE POLICY view_published_courseware ON courseware FOR SELECT
  USING (status = 'published');

-- Audit logs are read-only for super admins
CREATE POLICY super_admin_view_audit ON courseware_audit_log FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to check for duplicates
CREATE OR REPLACE FUNCTION check_courseware_duplicate(
  p_file_hash TEXT,
  p_isbn_13 TEXT,
  p_title TEXT,
  p_edition TEXT
) RETURNS TABLE (
  is_duplicate BOOLEAN,
  duplicate_id UUID,
  confidence TEXT,
  method TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check exact file hash match
  IF EXISTS (SELECT 1 FROM courseware WHERE file_hash = p_file_hash AND status != 'archived') THEN
    RETURN QUERY SELECT true, id, 'exact'::TEXT, 'file_hash'::TEXT 
                 FROM courseware WHERE file_hash = p_file_hash AND status != 'archived' LIMIT 1;
    RETURN;
  END IF;
  
  -- Check ISBN match
  IF p_isbn_13 IS NOT NULL AND EXISTS (SELECT 1 FROM courseware WHERE isbn_13 = p_isbn_13 AND status != 'archived') THEN
    RETURN QUERY SELECT true, id, 'exact'::TEXT, 'isbn'::TEXT 
                 FROM courseware WHERE isbn_13 = p_isbn_13 AND status != 'archived' LIMIT 1;
    RETURN;
  END IF;
  
  -- Check title + edition match
  IF EXISTS (SELECT 1 FROM courseware WHERE title = p_title AND edition = p_edition AND status != 'archived') THEN
    RETURN QUERY SELECT true, id, 'high'::TEXT, 'title_edition'::TEXT 
                 FROM courseware WHERE title = p_title AND edition = p_edition AND status != 'archived' LIMIT 1;
    RETURN;
  END IF;
  
  -- No duplicate found
  RETURN QUERY SELECT false, NULL::UUID, NULL::TEXT, NULL::TEXT;
END;
$$;

-- Function to update batch statistics
CREATE OR REPLACE FUNCTION update_batch_statistics(p_batch_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE upload_batches SET
    total_files = (SELECT COUNT(*) FROM upload_jobs WHERE batch_id = p_batch_id),
    successful_uploads = (SELECT COUNT(*) FROM upload_jobs WHERE batch_id = p_batch_id AND status = 'published'),
    failed_uploads = (SELECT COUNT(*) FROM upload_jobs WHERE batch_id = p_batch_id AND status IN ('validation_failed', 'processing_failed', 'quarantined')),
    updated_at = now()
  WHERE id = p_batch_id;
END;
$$;

-- ============================================
-- INITIAL DATA
-- ============================================
-- Insert default categories
INSERT INTO categories (name, description) VALUES
  ('Computer Science', 'Computer science and programming courses'),
  ('Mathematics', 'Mathematics and statistics courses'),
  ('Business', 'Business and management courses'),
  ('Marketing', 'Marketing and sales courses'),
  ('Design', 'Design and creative courses'),
  ('Science', 'Natural sciences courses'),
  ('Humanities', 'Humanities and liberal arts courses'),
  ('Languages', 'Language learning courses')
ON CONFLICT (name) DO NOTHING;

-- Insert default subjects
INSERT INTO subjects (name, description) VALUES
  ('Programming', 'Programming and software development'),
  ('Data Science', 'Data science and analytics'),
  ('Web Development', 'Web development technologies'),
  ('Mobile Development', 'Mobile app development'),
  ('Algorithms', 'Algorithms and data structures'),
  ('Database', 'Database management and design'),
  ('Machine Learning', 'Machine learning and AI'),
  ('Statistics', 'Statistics and probability')
ON CONFLICT (name) DO NOTHING;
