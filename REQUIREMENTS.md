# RITHand (Right IT Hand) — Requirements v0.1

## Vision

A web application that serves as the go-to dashboard for IT Directors, vCIOs, and vCISOs — aggregating vendor-specific news, alerts, and intelligence relevant to their technology stack.

## Core Concepts

- **User**: An IT leader who manages a portfolio of technology vendors
- **Vendor**: A technology company/product in the network, IT, or cybersecurity space
- **Feed**: A stream of news/alerts tied to a specific vendor

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js (App Router) | Full-stack React framework with SSR/SSG |
| UI | Tailwind CSS + shadcn/ui | Utility-first styling + polished component library |
| Icons | Lucide React | Consistent icon set |
| State | React Context (local) | Lightweight state management for POC |
| Data | JSON files (local) | Hardcoded seed data for POC phase |
| Auth | Hardcoded credentials | Simple login gate for POC; replaceable with Auth0/Clerk/NextAuth later |
| Animations | Framer Motion | Subtle UI transitions |

---

## Seed Vendors (Initial List)

Categorized by function:

### Networking
- Cisco
- Cisco Meraki
- Ubiquiti
- Aruba (HPE)
- Juniper Networks

### Firewalls / Security Appliances
- Palo Alto Networks
- Fortinet
- SonicWall
- WatchGuard
- Sophos

### Cloud / Infrastructure
- Microsoft (Azure / M365)
- Amazon Web Services (AWS)
- Google Cloud Platform (GCP)

### Endpoint Security
- CrowdStrike
- SentinelOne
- Carbon Black (VMware)
- Microsoft Defender

### RMM / PSA (MSP Tools)
- ConnectWise
- Datto (Kaseya)
- NinjaOne
- N-able

### Backup & DR
- Veeam
- Acronis
- Druva

### Identity & Access
- Okta
- Duo Security (Cisco)
- JumpCloud

---

## Functional Requirements

### Phase 1 — Proof of Concept (Current)

1. **Landing / Dashboard Page**
   - Aggregated news feed for selected vendors
   - Filter by vendor and category
   - Sort by date (newest first)
   - Visual vendor cards with logos and category tags

2. **Vendor Selection**
   - Browse master vendor list by category
   - Toggle vendors on/off for personalized feed
   - Persist selection in browser local storage

3. **News Feed Display**
   - Each item shows: title, summary, vendor, category, date, source link
   - Mark as read/unread
   - Bookmark/save for later
   - Mock/seed data for POC

4. **Search**
   - Full-text search across news items
   - Filter results by vendor/category

5. **Responsive Design**
   - Mobile-friendly layout
   - Sidebar navigation on desktop, bottom nav or hamburger on mobile

### Phase 2 — Design & Feature Refinement

6. **Live News Aggregation**
   - RSS feed integration for vendor blogs
   - Security advisory feeds (CVE, NVD, vendor-specific)
   - Patch/update notification parsing

7. **Alerts & Notifications**
   - Configurable alert rules (critical CVEs, outages, EOL announcements)
   - In-app notification center
   - Email digest (daily/weekly)

8. **Enhanced Dashboard**
   - Vendor health/status widgets
   - Trending topics across selected vendors
   - Timeline view of recent events

### Phase 3 — Integrations & Auth

9. **User Authentication**
   - Replace hardcoded login with proper auth provider (Auth0, Clerk, or NextAuth)
   - Role-based access (IT Director, vCIO, vCISO)
   - User profile and preferences stored server-side

10. **Database Migration**
    - Move from local JSON to PostgreSQL or similar
    - API routes for CRUD operations

11. **Multi-Tenancy (Future)**
    - Architecture supports per-tenant vendor lists and user pools
    - MSP model: one org manages multiple client environments
    - Data isolation between tenants

---

## Non-Functional Requirements

- **Performance**: Dashboard loads in under 2 seconds
- **Scalable Architecture**: Component and data model design that supports future multi-tenancy
- **Accessibility**: WCAG 2.1 AA baseline
- **Browser Support**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge)

---

## Priority Order

1. Scaffold Next.js app with Tailwind + shadcn/ui
2. Build dashboard layout (sidebar, header, main content area)
3. Seed vendor data and display vendor selection page
4. Build mock news feed with seed data
5. Add filtering, sorting, and search
6. Add bookmarks and read/unread state
7. Add hardcoded login gate
8. Polish UI and responsive design
9. (Phase 2+) Live data, alerts, integrations, real auth
