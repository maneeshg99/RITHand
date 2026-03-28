-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 006: App Admin Role, Ticket Column, Profile Enhancements
--
-- Adds:
-- 1. app_role column to profiles (for application-level admin)
-- 2. onboarded flag to profiles
-- 3. ticket column to client_vulnerabilities
-- 4. RLS policies for app admins to read all orgs/members/clients
-- 5. Helper function is_app_admin()
-- 6. Admin bootstrap function for creating orgs as app admin
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Profile enhancements ────────────────────────────────────────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS app_role TEXT CHECK (app_role IN ('app_admin')) DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarded BOOLEAN DEFAULT FALSE;

-- ─── Ticket column on vulnerabilities ────────────────────────────────────────

ALTER TABLE client_vulnerabilities ADD COLUMN IF NOT EXISTS ticket TEXT;

-- ─── Helper: is_app_admin ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION is_app_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = check_user_id AND app_role = 'app_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE SET search_path = public;

-- ─── App admins can read ALL profiles ────────────────────────────────────────

CREATE POLICY "App admins can read all profiles" ON profiles
  FOR SELECT USING (is_app_admin(auth.uid()));

-- App admins can update any profile (for role switching in test env)
CREATE POLICY "App admins can update all profiles" ON profiles
  FOR UPDATE USING (is_app_admin(auth.uid()));

-- ─── App admins can read ALL organizations ───────────────────────────────────

CREATE POLICY "App admins can read all organizations" ON organizations
  FOR SELECT USING (is_app_admin(auth.uid()));

CREATE POLICY "App admins can insert organizations" ON organizations
  FOR INSERT WITH CHECK (is_app_admin(auth.uid()));

CREATE POLICY "App admins can update organizations" ON organizations
  FOR UPDATE USING (is_app_admin(auth.uid()));

CREATE POLICY "App admins can delete organizations" ON organizations
  FOR DELETE USING (is_app_admin(auth.uid()));

-- ─── App admins can read ALL organization members ────────────────────────────

CREATE POLICY "App admins can read all org members" ON organization_members
  FOR SELECT USING (is_app_admin(auth.uid()));

CREATE POLICY "App admins can insert org members" ON organization_members
  FOR INSERT WITH CHECK (is_app_admin(auth.uid()));

CREATE POLICY "App admins can update org members" ON organization_members
  FOR UPDATE USING (is_app_admin(auth.uid()));

CREATE POLICY "App admins can delete org members" ON organization_members
  FOR DELETE USING (is_app_admin(auth.uid()));

-- ─── App admins can read ALL clients ─────────────────────────────────────────

CREATE POLICY "App admins can read all clients" ON clients
  FOR SELECT USING (is_app_admin(auth.uid()));

CREATE POLICY "App admins can insert all clients" ON clients
  FOR INSERT WITH CHECK (is_app_admin(auth.uid()));

CREATE POLICY "App admins can update all clients" ON clients
  FOR UPDATE USING (is_app_admin(auth.uid()));

CREATE POLICY "App admins can delete all clients" ON clients
  FOR DELETE USING (is_app_admin(auth.uid()));

-- ─── Function: switch_test_role (for dev/test environment) ───────────────────

CREATE OR REPLACE FUNCTION switch_test_role(
  target_role TEXT  -- 'app_admin', 'org_admin', 'org_user'
)
RETURNS VOID AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  CASE target_role
    WHEN 'app_admin' THEN
      -- Set app_role and make org admin
      UPDATE profiles SET app_role = 'app_admin' WHERE id = current_user_id;
      UPDATE organization_members SET role = 'admin' WHERE user_id = current_user_id;

    WHEN 'org_admin' THEN
      -- Remove app_role, keep org admin
      UPDATE profiles SET app_role = NULL WHERE id = current_user_id;
      UPDATE organization_members SET role = 'admin' WHERE user_id = current_user_id;

    WHEN 'org_user' THEN
      -- Remove app_role, set org member
      UPDATE profiles SET app_role = NULL WHERE id = current_user_id;
      UPDATE organization_members SET role = 'member' WHERE user_id = current_user_id;

    ELSE
      RAISE EXCEPTION 'Invalid role: %', target_role;
  END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ─── Admin function: create org and assign users ─────────────────────────────

CREATE OR REPLACE FUNCTION admin_create_organization(
  org_name TEXT,
  admin_user_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_org_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  IF NOT is_app_admin(current_user_id) THEN
    RAISE EXCEPTION 'Only app admins can create organizations';
  END IF;

  INSERT INTO organizations (name)
  VALUES (org_name)
  RETURNING id INTO new_org_id;

  -- If an admin user was specified, make them the org admin
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO organization_members (organization_id, user_id, role)
    VALUES (new_org_id, admin_user_id, 'admin')
    ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'admin';
  END IF;

  RETURN new_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ─── Notify PostgREST ────────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
