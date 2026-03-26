-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 002: Access Management — Clients + Client Members + RLS
-- ═══════════════════════════════════════════════════════════════════════════════

-- Add username column to profiles if it doesn't exist yet
-- (It was added manually during Phase 1 admin setup, but codify it here)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- ─── Clients table ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  name            TEXT NOT NULL,
  industry        TEXT,
  primary_contact TEXT,
  contact_email   TEXT,
  notes           TEXT,
  status          TEXT NOT NULL CHECK (status IN ('active','onboarding','offboarding','inactive')) DEFAULT 'active',
  created_by      UUID REFERENCES auth.users,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- ─── Client Members table (per-client access control) ─────────────────────────

CREATE TABLE IF NOT EXISTS client_members (
  client_id       UUID NOT NULL REFERENCES clients ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('editor','viewer')) DEFAULT 'viewer',
  assigned_by     UUID REFERENCES auth.users,
  assigned_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (client_id, user_id)
);

ALTER TABLE client_members ENABLE ROW LEVEL SECURITY;

-- ─── Helper function: check if a user is an org admin ─────────────────────────
-- Used in RLS policies to avoid repeating the same subquery everywhere.

CREATE OR REPLACE FUNCTION is_org_admin(check_org_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = check_org_id
      AND user_id = check_user_id
      AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── Helper function: check if a user is a client member ──────────────────────

CREATE OR REPLACE FUNCTION is_client_member(check_client_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM client_members
    WHERE client_id = check_client_id
      AND user_id = check_user_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── Helper function: check if a user is a client editor ──────────────────────

CREATE OR REPLACE FUNCTION is_client_editor(check_client_id UUID, check_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM client_members
    WHERE client_id = check_client_id
      AND user_id = check_user_id
      AND role = 'editor'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── RLS Policies: clients ────────────────────────────────────────────────────

-- Org admins can see all clients in their org
CREATE POLICY "Org admins can read all clients"
  ON clients FOR SELECT
  USING (is_org_admin(org_id, auth.uid()));

-- Assigned members can see their clients
CREATE POLICY "Assigned members can read their clients"
  ON clients FOR SELECT
  USING (is_client_member(id, auth.uid()));

-- Only org admins can create clients
CREATE POLICY "Org admins can create clients"
  ON clients FOR INSERT
  WITH CHECK (is_org_admin(org_id, auth.uid()));

-- Only org admins can update clients
CREATE POLICY "Org admins can update clients"
  ON clients FOR UPDATE
  USING (is_org_admin(org_id, auth.uid()));

-- Only org admins can delete clients
CREATE POLICY "Org admins can delete clients"
  ON clients FOR DELETE
  USING (is_org_admin(org_id, auth.uid()));

-- ─── RLS Policies: client_members ─────────────────────────────────────────────

-- Users can see their own assignments
CREATE POLICY "Users can see own client assignments"
  ON client_members FOR SELECT
  USING (user_id = auth.uid());

-- Org admins can see all assignments for their org's clients
CREATE POLICY "Org admins can see all client assignments"
  ON client_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_members.client_id
        AND is_org_admin(c.org_id, auth.uid())
    )
  );

-- Only org admins can assign users to clients
CREATE POLICY "Org admins can assign users to clients"
  ON client_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_id
        AND is_org_admin(c.org_id, auth.uid())
    )
  );

-- Only org admins can change roles
CREATE POLICY "Org admins can update client assignments"
  ON client_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_members.client_id
        AND is_org_admin(c.org_id, auth.uid())
    )
  );

-- Only org admins can remove users from clients
CREATE POLICY "Org admins can remove client assignments"
  ON client_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM clients c
      WHERE c.id = client_members.client_id
        AND is_org_admin(c.org_id, auth.uid())
    )
  );

-- ─── Update profiles RLS to let admins read all org members' profiles ─────────
-- The original policy only lets users read their OWN profile.
-- Admins need to see all org members to assign them to clients.

CREATE POLICY "Org admins can read org member profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members om1
      JOIN organization_members om2
        ON om1.organization_id = om2.organization_id
      WHERE om1.user_id = auth.uid()
        AND om1.role = 'admin'
        AND om2.user_id = profiles.id
    )
  );

-- ─── Notify PostgREST to reload schema ───────────────────────────────────────
NOTIFY pgrst, 'reload schema';
