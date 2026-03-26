# RITHand — Product Build Plan
**Updated:** 2026-03-25
**Target users:** vCIOs, IT Directors, vCISOs, Technical Account Managers at MSPs

---

## Completed: Phase 1 — Infrastructure & Auth

All done. The app now has:
- Supabase auth (email/password + username login + magic link)
- Route restructure: public landing at `/`, protected app at `/app/*`
- Middleware protecting all `/app/*` routes
- Login / Signup / Onboarding pages
- Marketing landing page
- Full database schema with RLS (profiles, organizations, members, licenses, vendors, news state, compliance, EOL, CVE)
- `.env.local` configured with Supabase credentials

---

## Phase 1.5 — Access Management & Admin Panel (Next Build)

**Why this comes before Phase 2:** Every feature attaches to a client, and every client needs proper access control. Building RBAC first means all downstream features inherit correct permissions automatically.

### Access Hierarchy

```
Organization (the MSP)
  └─ Organization Members (admin vs member)
       └─ Clients (customer accounts)
            └─ Client Members (editor vs viewer)
```

**Rules:**
- Org **admins** see all clients, can create/delete clients, and manage user-client assignments
- Org **members** see only clients they are explicitly assigned to via `client_members`
- Per client, a user is either **editor** (read + write) or **viewer** (read only)
- Admins must also be explicitly assigned as editors to clients they work on
- New users start with zero client access until an admin assigns them
- Removing a user from a client removes their access, not the data

### Data Model

```sql
-- Clients table (customer accounts managed by the MSP)
CREATE TABLE clients (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations ON DELETE CASCADE,
  name            TEXT NOT NULL,
  industry        TEXT,
  primary_contact TEXT,
  contact_email   TEXT,
  notes           TEXT,
  status          TEXT CHECK (status IN ('active','onboarding','offboarding','inactive')) DEFAULT 'active',
  created_by      UUID REFERENCES auth.users,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Client members (per-client access control)
CREATE TABLE client_members (
  client_id       UUID NOT NULL REFERENCES clients ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role            TEXT NOT NULL CHECK (role IN ('editor','viewer')) DEFAULT 'viewer',
  assigned_by     UUID REFERENCES auth.users,
  assigned_at     TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (client_id, user_id)
);
```

### RLS Strategy

All client-scoped tables follow this pattern:
- **SELECT:** user is in `client_members` for that client OR user is an org admin
- **INSERT/UPDATE/DELETE:** user is in `client_members` with `role = 'editor'` OR user is an org admin
- **Client CRUD (create/delete):** org admin only
- **client_members CRUD:** org admin only

### Admin Panel — `/app/admin`

Only visible to org admins (sidebar link hidden for non-admins, route protected by middleware).

**Clients tab:**
- Create new client (name, industry, contact info, status)
- Edit/deactivate existing clients
- View all clients with status badges

**Users tab:**
- View all org members with their roles
- See which clients each user is assigned to

**Per-client access management:**
- On client detail: "Access" section showing assigned users + their roles
- Add user to client (pick from org members, choose editor/viewer)
- Change a user's role on a client
- Remove a user from a client

### Build Order

1. Database migration (`002_access_management.sql`) — clients, client_members, RLS policies
2. Role-checking utility functions (`lib/auth/roles.ts`)
3. Admin panel pages (`/app/admin`, `/app/admin/clients`, `/app/admin/clients/[id]`)
4. Sidebar update — conditional "Admin" nav item
5. Middleware — protect `/app/admin/*` routes

---

## Phase 2 — Core Features

These are standalone tools that require no external integrations. They build on the existing database and provide daily-use value for a vCIO/TAM managing enterprise client accounts. All Phase 2 tables use the RLS pattern established in Phase 1.5.

### 2.1 — Client Workspaces (UI)

**What:** The client detail pages with tabbed interface. The `clients` table and access control already exist from Phase 1.5 — this phase adds the UI and `client_vendors` junction table.

**Data model:**
```
client_vendors                             -- which vendors this client uses
  client_id       uuid FK → clients
  vendor_id       text                     -- matches src/data/vendors.ts
  PRIMARY KEY (client_id, vendor_id)
```

**UI:**
- `/app/clients` — grid/list of all assigned clients with status badges
- `/app/clients/[id]` — client detail page with tabbed interface:
  - Overview (contact info, notes, stats)
  - Vendors (which vendors this client uses)
  - Tasks (action items for this client)
  - Meetings (agendas & notes)
  - Vulnerabilities (CVE tracker)
  - Compliance (framework status)
  - Access (admin only — manage who can see this client)
- Client switcher in the sidebar or top nav
- The existing dashboard at `/app` becomes a cross-client overview

**Implementation notes:**
- RLS uses the Phase 1.5 pattern: check `client_members` or org admin status
- Sidebar gets a "Clients" nav item

---

### 2.2 — Task Board & Action Item Tracker

**What:** A per-client kanban/list board for tracking action items. Tasks can come from meetings, vulnerability remediation, compliance gaps, or ad-hoc work. Simple enough to use daily, structured enough to report on.

**Data model:**
```
tasks
  id              uuid PK
  client_id       uuid FK → clients
  org_id          uuid FK → organizations
  title           text NOT NULL
  description     text
  status          text CHECK (backlog, in_progress, waiting_on_client, done, cancelled)
  priority        text CHECK (critical, high, medium, low)
  category        text CHECK (security, infrastructure, compliance, project, general)
  assigned_to     uuid FK → profiles       -- who owns this task
  due_date        date
  source_type     text                     -- 'meeting', 'cve', 'eol', 'compliance', 'manual'
  source_id       text                     -- optional FK to the originating item
  created_by      uuid FK → profiles
  created_at      timestamptz
  updated_at      timestamptz
  completed_at    timestamptz

task_comments
  id              uuid PK
  task_id         uuid FK → tasks
  user_id         uuid FK → profiles
  content         text NOT NULL
  created_at      timestamptz
```

**UI:**
- Tab within `/app/clients/[id]` → "Tasks" tab
- Two view modes: Kanban board (columns = status) and List view (sortable table)
- Quick-add: title + priority + category inline form
- Task detail slide-out panel: full description, comments, activity log, linked items
- Filter by: status, priority, category, assigned to, due date
- Cross-client task view at `/app/tasks` — all tasks across all clients, filterable

**Implementation notes:**
- No external dependencies — pure Supabase CRUD
- RLS scoped to org membership
- Tasks link to source items (CVE, EOL, compliance item) for traceability

---

### 2.3 — Meeting Agenda & Notes Tracker

**What:** Create meeting agendas tied to a client, take notes during meetings, and track action items that come out of them. Previous meetings stay accessible for reference.

**Data model:**
```
meetings
  id              uuid PK
  client_id       uuid FK → clients
  org_id          uuid FK → organizations
  title           text NOT NULL            -- "Weekly Sync", "Q1 2026 QBR"
  meeting_type    text CHECK (weekly_sync, monthly_review, qbr, project, ad_hoc)
  scheduled_date  timestamptz
  status          text CHECK (upcoming, in_progress, completed, cancelled)
  created_by      uuid FK → profiles
  created_at      timestamptz
  updated_at      timestamptz

meeting_agenda_items
  id              uuid PK
  meeting_id      uuid FK → meetings
  title           text NOT NULL
  notes           text                     -- notes taken during the meeting
  sort_order      int
  linked_type     text                     -- 'cve', 'eol', 'task', 'compliance', null
  linked_id       text                     -- FK to the linked item
  created_at      timestamptz

meeting_action_items                        -- auto-creates tasks
  id              uuid PK
  meeting_id      uuid FK → meetings
  agenda_item_id  uuid FK → meeting_agenda_items (nullable)
  task_id         uuid FK → tasks          -- the created task
  created_at      timestamptz
```

**UI:**
- Tab within `/app/clients/[id]` → "Meetings" tab
- Meeting list: upcoming and past meetings, sorted by date
- Create meeting: title, type, date, then add agenda items
- Meeting detail page (`/app/clients/[id]/meetings/[mid]`):
  - Agenda items in an ordered list
  - Each item: title, notes field (rich text or markdown), link to a CVE/task/EOL
  - "Create action item" button on any agenda item → creates a task and links it
  - Meeting summary section at the bottom
- Previous meeting viewer: click any past meeting to review notes and action items
- "Carry forward" button: unresolved items from last meeting auto-populate next agenda

**Implementation notes:**
- Meeting action items create actual `tasks` records with `source_type = 'meeting'`
- The "carry forward" feature queries the last meeting's unresolved agenda items

---

### 2.4 — Vulnerability Management Tracker

**What:** Goes beyond the existing CVE alerts tab. Per-client vulnerability tracking with status, ownership, remediation notes, and risk acceptance documentation.

**Data model:**
```
client_vulnerabilities
  id              uuid PK
  client_id       uuid FK → clients
  org_id          uuid FK → organizations
  cve_id          text                     -- e.g. "CVE-2026-1234" (optional, can be non-CVE vulns)
  title           text NOT NULL
  vendor_id       text                     -- which vendor product is affected
  severity        text CHECK (critical, high, medium, low, info)
  cvss_score      numeric(4,1)
  status          text CHECK (open, in_progress, mitigated, accepted_risk, false_positive)
  assigned_to     uuid FK → profiles
  affected_assets text                     -- free text or count: "3 firewalls", "all endpoints"
  remediation_plan text                    -- what needs to happen to fix this
  remediation_notes text                   -- what was actually done
  risk_acceptance_reason text              -- if status = accepted_risk, why
  discovered_date date
  remediated_date date
  due_date        date
  created_by      uuid FK → profiles
  created_at      timestamptz
  updated_at      timestamptz
```

**UI:**
- Tab within `/app/clients/[id]` → "Vulnerabilities" tab
- Table view with columns: CVE ID, Title, Vendor, Severity, Status, Assigned To, Due Date
- Color-coded severity badges (existing pattern from CVE alerts)
- Filters: severity, status, vendor, assigned to
- Vulnerability detail panel:
  - Full description, affected assets, CVSS score
  - Status workflow: Open → In Progress → Mitigated / Accepted Risk
  - Remediation plan (what to do) and notes (what was done)
  - If accepted risk: reason field (for audit trail)
  - Link to create a task from this vulnerability
- Bulk import: paste CVE IDs and auto-populate from the NVD seed data
- Cross-client vulnerability view at `/app/vulnerabilities`:
  - "CVE-2026-1234 affects: Client A, Client C, Client F"
  - Aggregate stats: total open critical/high across all clients

**Implementation notes:**
- Auto-suggest: when a new vendor CVE comes in through the news feed, suggest adding it to clients that use that vendor
- Status changes are timestamped for audit trail
- Creating a task from a vulnerability sets `source_type = 'cve'` and links back

---

## Phase 3 — Gap Analysis Assessment Wizard

**What:** A guided, per-client assessment that walks through a compliance framework control-by-control, asks structured questions, auto-scores maturity, and generates a gap report with prioritized remediation recommendations.

**Approach:** Assessment wizard — more structured than a checklist, asks questions per control area, auto-calculates maturity based on answers.

**Data model:**
```
assessments
  id              uuid PK
  client_id       uuid FK → clients
  org_id          uuid FK → organizations
  framework_id    text                     -- 'nist_csf_2', 'cis_v8', 'cmmc_2', etc.
  status          text CHECK (draft, in_progress, completed)
  started_at      timestamptz
  completed_at    timestamptz
  conducted_by    uuid FK → profiles
  overall_score   numeric(5,2)             -- calculated overall maturity score
  created_at      timestamptz

assessment_responses
  id              uuid PK
  assessment_id   uuid FK → assessments
  control_id      text                     -- matches the framework's control identifier
  section_id      text                     -- which section/category this belongs to
  maturity_level  int CHECK (0-5)          -- 0=Not Assessed, 1=Not Implemented, 2=Partial, 3=Implemented, 4=Managed, 5=Optimized
  evidence        text                     -- what evidence supports this rating
  gap_description text                     -- what's missing to reach next level
  remediation_rec text                     -- recommended action to close the gap
  priority        text CHECK (critical, high, medium, low)
  effort_estimate text CHECK (quick_win, moderate, major_project)
  notes           text
  updated_at      timestamptz

assessment_reports                          -- generated report snapshots
  id              uuid PK
  assessment_id   uuid FK → assessments
  report_type     text CHECK (full, executive_summary, remediation_plan)
  generated_at    timestamptz
  report_data     jsonb                    -- structured data for rendering/exporting
```

**UI (wizard flow):**
1. Select client → Select framework → Start assessment
2. Step through each control section:
   - Question prompt explaining what this control means
   - Maturity rating selector (1-5 with descriptions for each level)
   - Evidence notes field
   - Gap description (auto-prompted if maturity < target)
   - Remediation recommendation
   - Priority + effort estimate
   - "Skip" / "Save & Next" / "Back"
3. Section summary: radar/spider chart of maturity by section
4. Final report: overall score, section breakdown, top gaps by priority, remediation roadmap
5. Export options: PDF report, CSV data, or shareable link

**Implementation notes:**
- Framework questions/controls come from expanded versions of our existing `src/data/compliance.ts`
- Each framework needs a "target maturity level" (configurable per client)
- The wizard saves progress — you can stop and resume
- Reports are snapshots — run the assessment again next quarter and compare

---

## Phase 4 — Advanced Features (Post-core)

These come after the core is solid:

- **Client Health Scorecards** — calculated from: compliance %, open critical CVEs, overdue tasks, EOL items, days since last meeting
- **Technology Roadmap Builder** — visual timeline per client for planned upgrades, migrations, renewals
- **QBR Report Generator** — one-click PDF/PPTX report per client pulling data from all modules
- **Email Alerts & Digests** — daily/weekly digest of new CVEs for tracked vendors, overdue tasks, upcoming EOLs
- **API Access** — REST API for Pro tier users to pull data into PSA tools
- **PSA/RMM Integrations** — ConnectWise, Datto/Autotask, NinjaRMM data sync (when ready)

---

## Build Status

| Phase | Feature | Status | Notes |
|-------|---------|--------|-------|
| 1 | Infrastructure & Auth | ✅ Done | Supabase, routes, login |
| 1.5 | Access Management & Admin Panel | ✅ Built | Run 002 migration, then verify admin |
| 2.1 | Client Workspaces UI | ✅ Built | `/app/clients`, `/app/clients/[id]` |
| 2.2 | Task Board | ✅ Built | Per-client + cross-client at `/app/tasks` |
| 2.3 | Meeting Tracker | ✅ Built | In client detail Meetings tab |
| 2.4 | Vulnerability Tracker | ✅ Built | Per-client + cross-client at `/app/vulnerabilities` |
| 3 | Gap Analysis Wizard (CIS v8) | ✅ Built | `/app/assessments/[id]`, 18 controls + 148 safeguards |
| 4 | Advanced Features | Planned | Health scores, QBR gen, roadmaps, integrations |

## Setup Steps (for new environment)

1. Run migrations in Supabase SQL Editor in order:
   - `supabase/migrations/002_access_management.sql`
   - `supabase/migrations/003_phase2_tables.sql`
   - `supabase/migrations/004_phase3_assessments.sql`
2. Run `node scripts/setup-access-management.mjs` to verify admin account
3. Start dev server: `npm run dev`
4. Navigate to `/app/admin` to create clients and assign users

---

*Last updated: 2026-03-25*
