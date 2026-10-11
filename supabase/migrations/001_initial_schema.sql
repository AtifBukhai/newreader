-- Kitabo Database Schema
-- PostgreSQL / Supabase Migration
-- Run this in your Supabase SQL Editor or via migrations

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('super_admin', 'partner_admin', 'support_agent', 'student');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'deactivated');
CREATE TYPE partner_status AS ENUM ('active', 'suspended', 'archived');
CREATE TYPE order_status AS ENUM ('draft', 'submitted', 'approved', 'processing', 'fulfilled', 'cancelled');
CREATE TYPE code_status AS ENUM ('generated', 'distributed', 'redeemed', 'expired', 'revoked', 'exhausted');
CREATE TYPE book_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE classroom_status AS ENUM ('active', 'archived');

-- ============================================
-- LEARNING PARTNERS (Organizations)
-- ============================================
CREATE TABLE learning_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status partner_status NOT NULL DEFAULT 'active',
  code_quota INTEGER NOT NULL DEFAULT 500,
  codes_used INTEGER NOT NULL DEFAULT 0,
  can_generate_codes BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  partner_id UUID REFERENCES learning_partners(id) ON DELETE SET NULL,
  status user_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX idx_profiles_partner ON profiles(partner_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_status ON profiles(status);

-- ============================================
-- BOOKS
-- ============================================
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  author TEXT NOT NULL,
  publisher TEXT,
  isbn TEXT,
  description TEXT,
  cover_url TEXT,
  language TEXT NOT NULL DEFAULT 'English',
  edition TEXT,
  page_count INTEGER NOT NULL DEFAULT 0,
  categories TEXT[] NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}',
  status book_status NOT NULL DEFAULT 'draft',
  version TEXT NOT NULL DEFAULT '1.0.0',
  storage_path TEXT, -- private storage path for original file
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_books_status ON books(status);

-- ============================================
-- BOOK-PARTNER APPROVALS
-- ============================================
CREATE TABLE book_partner_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES learning_partners(id) ON DELETE CASCADE,
  approved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  approved_by UUID REFERENCES profiles(id),
  UNIQUE(book_id, partner_id)
);

-- ============================================
-- CLASSROOMS
-- ============================================
CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  partner_id UUID NOT NULL REFERENCES learning_partners(id) ON DELETE CASCADE,
  status classroom_status NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_classrooms_partner ON classrooms(partner_id);

-- ============================================
-- CLASSROOM MEMBERSHIPS
-- ============================================
CREATE TABLE classroom_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(classroom_id, student_id)
);

-- ============================================
-- ORDERS
-- ============================================
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL, -- LP-entered external order ID
  partner_id UUID NOT NULL REFERENCES learning_partners(id),
  book_id UUID NOT NULL REFERENCES books(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0 AND quantity <= 1000),
  validity_days INTEGER NOT NULL CHECK (validity_days IN (30, 90, 180, 365)),
  max_devices INTEGER NOT NULL CHECK (max_devices >= 1 AND max_devices <= 10),
  status order_status NOT NULL DEFAULT 'draft',
  requested_by UUID NOT NULL REFERENCES profiles(id),
  order_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  fulfilled_at TIMESTAMPTZ,
  fulfilled_by UUID REFERENCES profiles(id),
  fulfillment_notes TEXT,
  customer_notes TEXT,
  idempotency_key TEXT UNIQUE, -- prevents duplicate fulfillment
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(order_id, partner_id)
);

CREATE INDEX idx_orders_partner ON orders(partner_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_book ON orders(book_id);

-- ============================================
-- ACCESS CODE BATCHES
-- ============================================
CREATE TABLE access_code_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES learning_partners(id),
  book_id UUID NOT NULL REFERENCES books(id),
  code_count INTEGER NOT NULL,
  codes_generated INTEGER NOT NULL DEFAULT 0,
  codes_redeemed INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ACCESS CODES
-- ============================================
CREATE TABLE access_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash TEXT NOT NULL UNIQUE, -- hashed code for lookup (bcrypt or similar)
  code_prefix TEXT NOT NULL, -- first 4 chars for partial search
  batch_id UUID NOT NULL REFERENCES access_code_batches(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id),
  book_id UUID NOT NULL REFERENCES books(id),
  partner_id UUID NOT NULL REFERENCES learning_partners(id),
  status code_status NOT NULL DEFAULT 'generated',
  validity_days INTEGER NOT NULL,
  max_devices INTEGER NOT NULL DEFAULT 1,
  redeemed_by UUID REFERENCES profiles(id),
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  revoked_by UUID REFERENCES profiles(id),
  revoke_reason TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_codes_batch ON access_codes(batch_id);
CREATE INDEX idx_codes_order ON access_codes(order_id);
CREATE INDEX idx_codes_partner ON access_codes(partner_id);
CREATE INDEX idx_codes_status ON access_codes(status);
CREATE INDEX idx_codes_redeemed_by ON access_codes(redeemed_by);
CREATE INDEX idx_codes_prefix ON access_codes(code_prefix);

-- ============================================
-- BOOK ENTITLEMENTS
-- ============================================
CREATE TABLE book_entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id),
  code_id UUID REFERENCES access_codes(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN NOT NULL DEFAULT false,
  max_devices INTEGER NOT NULL DEFAULT 1,
  UNIQUE(user_id, book_id, code_id)
);

CREATE INDEX idx_entitlements_user ON book_entitlements(user_id);
CREATE INDEX idx_entitlements_expires ON book_entitlements(expires_at);

-- ============================================
-- REGISTERED DEVICES
-- ============================================
CREATE TABLE registered_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entitlement_id UUID NOT NULL REFERENCES book_entitlements(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name TEXT,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entitlement_id, device_fingerprint)
);

-- ============================================
-- READING PROGRESS
-- ============================================
CREATE TABLE reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id),
  current_chapter INTEGER NOT NULL DEFAULT 0,
  current_page INTEGER NOT NULL DEFAULT 0,
  percent_complete INTEGER NOT NULL DEFAULT 0,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  total_read_seconds INTEGER NOT NULL DEFAULT 0,
  UNIQUE(user_id, book_id)
);

-- ============================================
-- BOOKMARKS
-- ============================================
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id),
  chapter INTEGER NOT NULL,
  page INTEGER NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- HIGHLIGHTS
-- ============================================
CREATE TABLE highlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES books(id),
  chapter INTEGER NOT NULL,
  page INTEGER NOT NULL,
  selected_text TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'yellow',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- AUDIT LOG
-- ============================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- ============================================
-- EXPORT RECORDS
-- ============================================
CREATE TABLE export_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  exported_by UUID NOT NULL REFERENCES profiles(id),
  format TEXT NOT NULL DEFAULT 'csv',
  record_count INTEGER NOT NULL,
  download_url TEXT, -- short-lived signed URL
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE highlights ENABLE ROW LEVEL SECURITY;

-- Super admins see everything
CREATE POLICY super_admin_all_profiles ON profiles FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'));

-- Users see their own profile
CREATE POLICY user_own_profile ON profiles FOR SELECT
  USING (id = auth.uid());

-- Partner admins see profiles in their org
CREATE POLICY partner_admin_org_profiles ON profiles FOR SELECT
  USING (
    partner_id = (SELECT partner_id FROM profiles WHERE id = auth.uid() AND role = 'partner_admin')
  );

-- Students see themselves
CREATE POLICY student_own_profile ON profiles FOR SELECT
  USING (id = auth.uid() AND role = 'student');

-- Orders: partner admins see their org's orders
CREATE POLICY partner_admin_orders ON orders FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'partner_admin' 
      AND partner_id = orders.partner_id
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'support_agent'))
  );

-- Access codes: based on partner membership or staff role
CREATE POLICY staff_all_codes ON access_codes FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'support_agent')));

CREATE POLICY partner_codes ON access_codes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'partner_admin' 
      AND partner_id = access_codes.partner_id
    )
  );

-- Entitlements: students see their own
CREATE POLICY student_own_entitlements ON book_entitlements FOR SELECT
  USING (user_id = auth.uid());

-- Reading data: students see their own
CREATE POLICY student_own_progress ON reading_progress FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY student_own_bookmarks ON bookmarks FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY student_own_highlights ON highlights FOR ALL
  USING (user_id = auth.uid());

-- Audit logs: staff only
CREATE POLICY staff_audit_logs ON audit_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'support_agent')));

-- ============================================
-- FUNCTIONS (Server-side via Edge Functions or RPC)
-- ============================================

-- Function: Generate access codes for an order (called via RPC/Edge Function)
CREATE OR REPLACE FUNCTION fulfill_order(
  p_order_id UUID,
  p_agent_id UUID,
  p_idempotency_key TEXT
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
  v_batch_id UUID;
  v_code TEXT;
  v_code_hash TEXT;
  v_prefix TEXT;
  v_codes_generated INTEGER := 0;
BEGIN
  -- Idempotency check
  IF EXISTS (SELECT 1 FROM orders WHERE id = p_order_id AND idempotency_key = p_idempotency_key) THEN
    RETURN json_build_object('status', 'already_fulfilled', 'order_id', p_order_id);
  END IF;

  -- Fetch and validate order
  SELECT * INTO v_order FROM orders WHERE id = p_order_id FOR UPDATE;
  
  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  
  IF v_order.status NOT IN ('approved', 'processing') THEN
    RAISE EXCEPTION 'Order cannot be fulfilled in status: %', v_order.status;
  END IF;
  
  IF v_order.idempotency_key IS NOT NULL THEN
    RETURN json_build_object('status', 'already_fulfilled', 'order_id', p_order_id);
  END IF;

  -- Create batch
  v_batch_id := gen_random_uuid();
  INSERT INTO access_code_batches (id, name, order_id, partner_id, book_id, code_count, created_by)
  VALUES (
    v_batch_id,
    v_order.order_id || ' Codes',
    v_order.id,
    v_order.partner_id,
    v_order.book_id,
    v_order.quantity,
    p_agent_id
  );

  -- Generate codes
  FOR i IN 1..v_order.quantity LOOP
    -- Generate cryptographically secure random code
    v_code := upper(
      substr(encode(gen_random_bytes(9), 'base64'), 1, 4) || '-' ||
      substr(encode(gen_random_bytes(9), 'base64'), 1, 4) || '-' ||
      substr(encode(gen_random_bytes(9), 'base64'), 1, 4)
    );
    -- Remove ambiguous characters
    v_code := replace(replace(replace(replace(v_code, '0', 'X'), 'O', 'Y'), 'I', 'Z'), 'l', 'W');
    v_code_hash := crypt(v_code, gen_salt('bf'));
    v_prefix := left(v_code, 4);
    
    INSERT INTO access_codes (code_hash, code_prefix, batch_id, order_id, book_id, partner_id, validity_days, max_devices, created_by)
    VALUES (v_code_hash, v_prefix, v_batch_id, v_order.id, v_order.book_id, v_order.partner_id, v_order.validity_days, v_order.max_devices, p_agent_id);
    
    v_codes_generated := v_codes_generated + 1;
  END LOOP;

  -- Update batch and order
  UPDATE access_code_batches SET codes_generated = v_codes_generated WHERE id = v_batch_id;
  UPDATE orders SET 
    status = 'fulfilled', 
    fulfilled_at = now(), 
    fulfilled_by = p_agent_id,
    idempotency_key = p_idempotency_key,
    updated_at = now()
  WHERE id = p_order_id;

  -- Audit
  INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, details)
  VALUES (p_agent_id, 'order.fulfilled', 'Order', p_order_id, 
    'Generated ' || v_codes_generated || ' codes for order ' || v_order.order_id);

  RETURN json_build_object('status', 'fulfilled', 'codes_generated', v_codes_generated, 'batch_id', v_batch_id);
END;
$$;

-- Function: Redeem an access code
CREATE OR REPLACE FUNCTION redeem_code(
  p_plain_code TEXT,
  p_user_id UUID
) RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_code RECORD;
  v_entitlement_id UUID;
  v_expires_at TIMESTAMPTZ;
  v_device_count INTEGER;
BEGIN
  -- Find the code by checking all codes (in production, use a lookup table or indexed hash)
  SELECT * INTO v_code FROM access_codes 
  WHERE code_hash = crypt(p_plain_code, code_hash)
  FOR UPDATE;

  IF v_code IS NULL THEN
    RAISE EXCEPTION 'Invalid access code';
  END IF;

  -- Validate code status
  IF v_code.status = 'redeemed' THEN
    -- Check if same user (idempotent redemption)
    IF v_code.redeemed_by = p_user_id THEN
      RETURN json_build_object('status', 'already_redeemed', 'book_id', v_code.book_id);
    END IF;
    RAISE EXCEPTION 'Code already redeemed by another user';
  END IF;

  IF v_code.status = 'expired' THEN
    RAISE EXCEPTION 'Code has expired';
  END IF;

  IF v_code.status = 'revoked' THEN
    RAISE EXCEPTION 'Code has been revoked';
  END IF;

  IF v_code.status NOT IN ('generated', 'distributed') THEN
    RAISE EXCEPTION 'Code cannot be redeemed in current status';
  END IF;

  -- Check user's partner matches code's partner
  IF EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id AND partner_id != v_code.partner_id AND partner_id IS NOT NULL) THEN
    RAISE EXCEPTION 'Code not valid for your organization';
  END IF;

  -- Check existing entitlement
  IF EXISTS (SELECT 1 FROM book_entitlements WHERE user_id = p_user_id AND book_id = v_code.book_id AND revoked = false) THEN
    RAISE EXCEPTION 'You already have access to this book';
  END IF;

  -- Calculate expiration
  v_expires_at := now() + (v_code.validity_days || ' days')::interval;

  -- Create entitlement
  v_entitlement_id := gen_random_uuid();
  INSERT INTO book_entitlements (id, user_id, book_id, code_id, expires_at, max_devices)
  VALUES (v_entitlement_id, p_user_id, v_code.book_id, v_code.id, v_expires_at, v_code.max_devices);

  -- Update code
  UPDATE access_codes SET 
    status = 'redeemed',
    redeemed_by = p_user_id,
    redeemed_at = now(),
    expires_at = v_expires_at
  WHERE id = v_code.id;

  -- Update batch counter
  UPDATE access_code_batches SET codes_redeemed = codes_redeemed + 1 WHERE id = v_code.batch_id;

  -- Audit
  INSERT INTO audit_logs (actor_id, action, resource_type, resource_id, details)
  VALUES (p_user_id, 'code.redeemed', 'AccessCode', v_code.id, 'Redeemed code for book ' || v_code.book_id);

  RETURN json_build_object(
    'status', 'redeemed',
    'entitlement_id', v_entitlement_id,
    'book_id', v_code.book_id,
    'expires_at', v_expires_at
  );
END;
$$;

-- ============================================
-- TRIGGERS for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_books_updated BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_partners_updated BEFORE UPDATE ON learning_partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- INITIAL SUPER ADMIN (run manually after first user signs up)
-- ============================================
-- After creating the first user via Supabase Auth, run:
-- UPDATE profiles SET role = 'super_admin' WHERE email = 'your-admin-email@example.com';
