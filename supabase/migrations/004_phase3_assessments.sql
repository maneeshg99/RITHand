-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration 004: Phase 3 — Gap Analysis Assessments
-- Depends on: 002 (clients, client_members), 003 (helper functions exist)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Assessments table ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS assessments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES clients ON DELETE CASCADE,
  org_id          UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  framework_id    TEXT NOT NULL,
  title           TEXT,
  status          TEXT NOT NULL CHECK (status IN ('draft','in_progress','completed')) DEFAULT 'draft',
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  conducted_by    UUID REFERENCES auth.users,
  overall_score   NUMERIC(5,2),
  target_maturity INT DEFAULT 3,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all assessments"
  ON assessments FOR SELECT
  USING (is_org_admin(org_id, auth.uid()));

CREATE POLICY "Members can read assigned client assessments"
  ON assessments FOR SELECT
  USING (is_client_member(client_id, auth.uid()));

CREATE POLICY "Editors can create assessments"
  ON assessments FOR INSERT
  WITH CHECK (
    is_client_editor(client_id, auth.uid())
    OR is_org_admin(org_id, auth.uid())
  );

CREATE POLICY "Editors can update assessments"
  ON assessments FOR UPDATE
  USING (
    is_client_editor(client_id, auth.uid())
    OR is_org_admin(org_id, auth.uid())
  );

CREATE POLICY "Editors can delete assessments"
  ON assessments FOR DELETE
  USING (
    is_client_editor(client_id, auth.uid())
    OR is_org_admin(org_id, auth.uid())
  );

-- ─── Assessment Responses ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS assessment_responses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id     UUID NOT NULL REFERENCES assessments ON DELETE CASCADE,
  control_id        TEXT NOT NULL,
  section_id        TEXT NOT NULL,
  maturity_level    INT CHECK (maturity_level BETWEEN 0 AND 5) DEFAULT 0,
  evidence          TEXT,
  gap_description   TEXT,
  remediation_rec   TEXT,
  priority          TEXT CHECK (priority IN ('critical','high','medium','low')),
  effort_estimate   TEXT CHECK (effort_estimate IN ('quick_win','moderate','major_project')),
  notes             TEXT,
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(assessment_id, control_id)
);

ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Assessment response read access"
  ON assessment_responses FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM assessments a WHERE a.id = assessment_responses.assessment_id
    AND (is_client_member(a.client_id, auth.uid()) OR is_org_admin(a.org_id, auth.uid()))
  ));

CREATE POLICY "Assessment response write access"
  ON assessment_responses FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM assessments a WHERE a.id = assessment_id
    AND (is_client_editor(a.client_id, auth.uid()) OR is_org_admin(a.org_id, auth.uid()))
  ));

CREATE POLICY "Assessment response update access"
  ON assessment_responses FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM assessments a WHERE a.id = assessment_responses.assessment_id
    AND (is_client_editor(a.client_id, auth.uid()) OR is_org_admin(a.org_id, auth.uid()))
  ));

CREATE POLICY "Assessment response delete access"
  ON assessment_responses FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM assessments a WHERE a.id = assessment_responses.assessment_id
    AND (is_client_editor(a.client_id, auth.uid()) OR is_org_admin(a.org_id, auth.uid()))
  ));

-- ─── Notify PostgREST ────────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
