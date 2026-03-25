# Changelog

All notable changes to RITHand will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Versioning convention**: Every change increments the patch (0.1.x) or minor (0.x.0) version.
> Production release will be **v1.0.0**.

---

## [Unreleased]

_Queue future changes here before the next version bump._

---

## [0.3.0] - 2026-03-25

### Fixed
- Removed invalid `experimental.turbopack` key from `next.config.ts` that caused build failure in Next.js 16.2.1

### Changed
- Dev script now uses `cross-env NODE_OPTIONS=--max-old-space-size=4096` for better memory handling
- Added `outputFileTracingRoot` to `next.config.ts`
- Added `cross-env` dev dependency
- Normalized line endings across config files (`.gitignore`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`, `components.json`, `README.md`, `REQUIREMENTS.md`)
- Added `next-env.d.ts` (auto-generated TypeScript declarations)

---

## [0.2.0] - 2026-03-25

### Added
- **Compliance Checklists** — manually-checkable framework checklists (SOC 2 Type II, HIPAA, NIST CSF, ISO 27001, PCI DSS, CMMC 2.0, CIS Controls v8, GDPR) with real sections and control items
  - Add/remove frameworks via dropdown
  - Click framework name to expand checklist organized by section
  - Per-item checkboxes with progress bar; state persisted in localStorage
- **EOL Tracker with Remediation** — end-of-life items filtered to selected vendors; each item expandable to show remediation snippets (replacement product or extended support purchase) with descriptions
  - "Open in new tab" link to `/eol/[id]` detail page
- **EOL Detail Page** (`/eol/[id]`) — standalone page showing product details, days remaining, replacement options, and extended support options
- **Vendor Patching Schedules** — shows patch cadence (schedule name, frequency, next date) for each selected vendor with release notes links
- **CVE Alerts** — vendor-relevant CVE alerts split into "Immediate Patch Required" (red banner) and "Recent CVEs"; each expandable with summary, affected products, and direct patch/advisory hyperlinks
- AppContext extended with compliance checklist state, user EOL items, and user CVE alerts
- Template data: 8 compliance frameworks, 4 EOL products with remediation options, 13 vendor patch schedules, 5 CVE alerts

### Removed
- Top stat cards (Open Incidents, Patch Compliance %, Expiring Licenses, Avg Resolution Time) — required client environment access
- Upcoming Renewals section — deferred to a later version
- Patch Compliance progress bar and endpoint stats — replaced by vendor patching schedules and CVE alerts
- `ComplianceScoreRing` component and score-based compliance posture display
- `LicenseRenewal`, `PatchCompliance`, and `IncidentSummary` data types and mock data

### Changed
- Dashboard layout: Compliance Checklists → EOL Tracker → Patching & CVE Alerts → News Feed
- All dashboard data assumes no client environment access; information is user-entered

---

## [0.1.1] - 2026-03-25

### Added
- Cursor pointer styling on interactive elements
- Vendor logos via Clearbit integration
- Compliance dashboard widgets (score rings, renewal list, EOL tracker, patch compliance bar, incident summary)
- Scaffolding config files (`AGENTS.md`, `CLAUDE.md`, `components.json`)

---

## [0.1.0] - 2026-03-25

### Added
- Initial project scaffold with Next.js 16 (App Router), Tailwind CSS 4, shadcn/ui
- Responsive sidebar navigation (desktop fixed, mobile hamburger overlay)
- Vendor selection page — 29 vendors across 7 categories with toggle and bulk select
- Vendor news feed with 20 mock items — search, multi-filter (severity, type, vendor), sort by date/severity
- News cards with severity badges, type icons, read/unread tracking, bookmark toggle, external source links
- Bookmarks page for saved news items
- Settings page with account summary and data management
- React Context state management with localStorage persistence
- Framer Motion animations for page transitions and card interactions
