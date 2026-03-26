-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 003: Phase 2 Tables — Tasks, Meetings, Vulnerabilities, Client Vendors
-- Depends on: 002_access_management.sql (clients, client_members, helper functions)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Client Vendors (which vendors a client uses) ─────────────────────────────

CREATE TABLE IF NOT EXISTS client_vendors (
  client_id   UUID NOT NULL REFERENCES clients ON DELETE CASCADE,
  vendor_id   TEXT NOT NULL,
  added_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (client_id, vendor_id)
);

ALTER TABLE client_vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all client vendors"
  ON client_vendors FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM clients c WHERE c.id = client_vendors.client_id
    AND is_org_admin(c.org_id, auth.uid())
  ));

CREATE POLICY "Members can read assigned client vendors"
  ON client_vendors FOR SELECT
  USING (is_client_member(client_id, auth.uid()));

CREATE POLICY "Editors can insert client vendors"
  ON client_vendors FOR INSERT
  WITH CHECK (
    is_client_editor(client_id, auth.uid())
    OR EXISTS (
      SELECT 1 FROM clients c WHERE c.id = client_id
      AND is_org_admin(c.org_id, auth.uid())
    )
  );

CREATE POLICY "Editors can delete client vendors"
  ON client_vendors FOR DELETE
  USING (
    is_client_editor(client_id, auth.uid())
    OR EXISTS (
      SELECT 1 FROM clients c WHERE c.id = client_vendors.client_id
      AND is_org_admin(c.org_id, auth.uid())
    )
  );

-- ─── Tasks table ──────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES clients ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  status          TEXT NOT NULL CHECK (status IN ('backlog','in_progress','waiting_on_client','done','cancelled')) DEFAULT 'backlog',
  priority        TEXT NOT NULL CHECK (priority IN ('critical','high','medium','low')) DEFAULT 'medium',
  category        TEXT CHECK (category IN ('security','infrastructure','compliance','project','general')) DEFAULT 'general',
  assigned_to     UUID REFERENCES auth.users,
  due_date        DATE,
  source_type     TEXT,
  source_id       TEXT,
  created_by      UUID REFERENCES auth.users,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- SELECT: client member or org admin
CREATE POLICY "Admins can read all tasks"
  ON tasks FOR SELECT
  USING (is_org_admin(org_id, auth.uid()));

CREATE POLICY "Members can read assigned client tasks"
  ON tasks FOR SELECT
  USING (is_client_member(client_id, auth.uid()));

-- INSERT: client editor or org admin
CREATE POLICY "Editors can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    is_client_editor(client_id, auth.uid())
    OR is_org_admin(org_id, auth.uid())
  );

-- UPDATE: client editor or org admin
CREATE POLICY "Editors can update tasks"
  ON tasks FOR UPDATE
  USING (
    is_client_editor(client_id, auth.uid())
    OR is_org_admin(org_id, auth.uid())
  );

-- DELETE: client editor or org admin
CREATE POLICY "Editors can delete tasks"
  ON tasks FOR DELETE
  USING (
    is_client_editor(client_id, auth.uid())
    OR is_org_admin(org_id, auth.uid())
  );

-- ─── Task Comments ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS task_comments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id     UUID NOT NULL REFERENCES tasks ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Task comment read access"
  ON task_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM tasks t WHERE t.id = task_comments.task_id
    AND (is_client_member(t.client_id, auth.uid()) OR is_org_admin(t.org_id, auth.uid()))
  ));

CREATE POLICY "Task comment write access"
  ON task_comments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM tasks t WHERE t.id = task_id
      AND (is_client_editor(t.client_id, auth.uid()) OR is_org_admin(t.org_id, auth.uid()))
    )
  );

CREATE POLICY "Task comment delete own"
  ON task_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ─── Meetings table ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS meetings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES clients ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  title           TEXT NOT NULL,
  meeting_type    TEXT CHECK (meeting_type IN ('weekly_sync','monthly_review','qbr','project','ad_hoc')) DEFAULT 'ad_hoc',
  scheduled_date  TIMESTAMPTZ,
  status          TEXT NOT NULL CHECK (status IN ('upcoming','in_progress','completed','cancelled')) DEFAULT 'upcoming',
  notes           TEXT,
  created_by      UUID REFERENCES auth.users,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all meetings"
  ON meetings FOR SELECT
  USING (is_org_admin(org_id, auth.uid()));

CREATE POLICY "Members can read assigned client meetings"
  ON meetings FOR SELECT
  USING (is_client_member(client_id, auth.uid()));

CREATE POLICY "Editors can create meetings"
  ON meetings FOR INSERT
  WITH CHECK (
    is_client_editor(client_id, auth.uid())
    OR is_org_admin(org_id, auth.uid())
  );

CREATE POLICY "Editors can update meetings"
  ON meetings FOR UPDATE
  USING (
    is_client_editor(client_id, auth.uid())
    OR is_org_admin(org_id, auth.uid())
  );

CREATE POLICY "Editors can delete meetings"
  ON meetings FOR DELETE
  USING (
    is_client_editor(client_id, auth.uid())
    OR is_org_admin(org_id, auth.uid())
  );

-- ─── Meeting Agenda Items ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS meeting_agenda_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id    UUID NOT NULL REFERENCES meetings ON DELETE CASCADE,
  title         TEXT NOT NULL,
  notes         TEXT,
  sort_order    INT DEFAULT 0,
  linked_type   TEXT,
  linked_id     TEXT,
  is_carried    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE meeting_agenda_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Agenda item read access"
  ON meeting_agenda_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM meetings m WHERE m.id = meeting_agenda_items.meeting_id
    AND (is_client_member(m.client_id, auth.uid()) OR is_org_admin(m.org_id, auth.uid()))
  ));

CREATE POLICY "Agenda item write access"
  ON meeting_agenda_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM meetings m WHERE m.id = meeting_id
    AND (is_client_editor(m.client_id, auth.uid()) OR is_org_admin(m.org_id, auth.uid()))
  ));

CREATE POLICY "Agenda item update access"
  ON meeting_agenda_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM meetings m WHERE m.id = meeting_agenda_items.meeting_id
    AND (is_client_editor(m.client_id, auth.uid()) OR is_org_admin(m.org_id, auth.uid()))
  ));

CREATE POLICY "Agenda item delete access"
  ON meeting_agenda_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM meetings m WHERE m.id = meeting_agenda_items.meeting_id
    AND (is_client_editor(m.client_id, auth.uid()) OR is_org_admin(m.org_id, auth.uid()))
  ));

-- ─── Meeting Action Items (links meetings → tasks) ───────────────────────────

CREATE TABLE IF NOT EXISTS meeting_action_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id      UUID NOT NULL REFERENCES meetings ON DELETE CASCADE,
  agenda_item_id  UUID REFERENCES meeting_agenda_items ON DELETE SET NULL,
  task_id         UUID NOT NULL REFERENCES tasks ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE meeting_action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Meeting action item read access"
  ON meeting_action_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM meetings m WHERE m.id = meeting_action_items.meeting_id
    AND (is_client_member(m.client_id, auth.uid()) OR is_org_admin(m.org_id, auth.uid()))
  ));

CREATE POLICY "Meeting action item write access"
  ON meeting_action_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM meetings m WHERE m.id = meeting_id
    AND (is_client_editor(m.client_id, auth.uid()) OR is_org_admin(m.org_id, auth.uid()))
  ));

-- ─── Client Vulnerabilities ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS client_vulnerabilities (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id             UUID NOT NULL REFERENCES clients ON DELETE CASCADE,
  org_id                UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  cve_id                TEXT,
  title                 TEXT NOT NULL,
  vendor_id             TEXT,
  severity              TEXT NOT NULL CHECK (severity IN ('critical','high','medium','low','info')) DEFAULT 'medium',
  cvss_score            NUMERIC(4,1),
  status                TEXT NOT NULL CHECK (status IN ('open','in_progress','mitigated','accepted_risk','false_positive')) DEFAULT 'open',
  assigned_to           UUID REFERENCES auth.users,
  affected_assets       TEXT,
  remediation_plan      TEXT,
  remediation_notes     TEXT,
  risk_acceptance_reason TEXT,
  discovered_date       DATE,
  remediated_date       DATE,
  due_date              DATE,
  created_by            UUID REFERENCES auth.users,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE client_vulnerabilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all vulnerabilities"
  ON client_vulnerabilities FOR SELECT
  USING (is_org_admin(org_id, auth.uid()));

CREATE POLICY "Members can read assigned client vulnerabilities"
  ON client_vulnerabilities FOR SELECT
  USING (is_client_member(client_id, auth.uid()));

CREATE POLICY "Editors can create vulnerabilities"
  ON client_vulnerabilities FOR INSERT
  WITH CHECK (
    is_client_editor(client_id, auth.uid())
    OR is_org_admin(org_id, auth.uid())
  );

CREATE POLICY "Editors can update vulnerabilities"
  ON client_vulnerabilities FOR UPDATE
  USING (
    is_client_editor(client_id, auth.uid())
    OR is_org_admin(org_id, auth.uid())
  );

CREATE POLICY "Editors can delete vulnerabilities"
  ON client_vulnerabilities FOR DELETE
  USING (
    is_client_editor(client_id, auth.uid())
    OR is_org_admin(org_id, auth.uid())
  );

-- ─── Notify PostgREST ────────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
