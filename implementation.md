# Incident & Ticketing Portal – Functional Overview & Codex Implementation Guide

This document provides a functional and technical blueprint for recreating the TOC Portal’s **incident management and ticketing capabilities** as a modern **Node.js** microservice deployed on **Railway** alongside the *Elliot* agent.

---

## 1 Functional Overview

> 🖥️ **UI Requirements Overview**
>
> Codex must ensure the following interfaces are implemented in the web UI:
>
> **Incident List View**
>
> - Table of incidents with sortable columns (ID, title, status, severity, priority, site, assigned to, last updated)
> - Search bar (free text)
> - Filter sidebar (status, priority, severity level, tags, site, customer)
> - Bulk action toolbar (assign, tag, close)
>
> **Incident Detail View**
>
> - Header: title, priority, severity, status (editable inline)
> - Related entities: customer, site, chargers
> - Tabs or sections:
>   - Timeline (comments, status updates)
>   - Root cause & action taken (editable fields)
>   - Audit log (read-only)
>
> **Create/Edit Incident Modal or Page**
>
> - Form inputs for title, description, priority, severity, site, chargers, customer, etc.
> - Inline validation
>
> **Navigation & User Features**
>
> - Navigation bar with saved filters or user-defined views
> - User profile menu (role label, logout)
> - Support mobile/responsive layout

The portal manages the lifecycle of technical incidents (e.g. charger faults, site offline) raised through manual user submission. It includes tools for assignment, auditing, filtering, and bulk operations. Key use cases:

### A. Incident Capture

- Ingest incidents via:
  - Webhook (/incidents)
  - Manual form submission by users
- Deduplicate based on external ID (e.g. same fault raised by multiple users)

### B. Incident Timeline & Audit

- Store timeline of events per incident:
  - Comments (internal/external)
  - Status changes (open → acknowledged → resolved)
- Track who made each update

### C. Prioritisation & Tagging

- Allow each incident to be tagged by:
  - Priority (critical, high, medium, low)
  - Source (manual, imported)
  - Affected asset (charger ID, site ID, router ID)
  - Severity level (e.g. SEV1A)

### D. Assignment & Workflow

- Assign incidents to individual engineers or squads
- Control who can transition incident statuses
- Perform bulk operations: assign, tag, close

### E. Dashboards, Filtering & Search

- UI views to:
  - Filter incidents by tag, priority, severity, site, customer, status
  - Full-text search on `title`, `rootCause`, `actionTaken`, `timeline`
  - Support saved filters and personal views



### F. Health, Monitoring & Seeding

- `/healthz` endpoint for service monitoring
- Prometheus metrics and structured logs
- Seed script with customers, sites, chargers, and sample incidents

### G. Permissions

- Viewer: can view and search
- Editor: can comment, assign, bulk edit
- Admin: can configure system settings and resolve incidents

## 2 System Architecture

| Layer        | Responsibility                 | Tech Choice                              |
| ------------ | ------------------------------ | ---------------------------------------- |
| API Gateway  | REST ingress, auth, rate-limit | Express @ `/src/api`                     |
| Core Service | Incident CRUD, timeline        | TypeScript modules under `/src/services` |
| Data Store   | Relational persistence         | PostgreSQL (Railway) via Prisma          |
| Auth         | RBAC, JWT validation           | Supabase Auth                            |

---

## 3 Deployment and Integration Notes

- Railway environment using PostgreSQL
- Authentication via Supabase

> See the following sections for schema, API routes, service flows, CI/CD, and future roadmap.

---

## 4 Schema, API, Service Workflows, and More

> Note: Codex must ensure that the **PostgreSQL database is created and seeded** with this exact table structure. Use Prisma to manage migrations and initialise schema. No other tables are required for MVP.

### 4.1 Database Schema (Prisma)

Additional note: The TOC Portal architecture includes structured references to chargers, sites, and customers. To align with that, the following supporting tables should also be defined to support tagging and filtering functionality, even if these are populated externally or manually linked during MVP:

```prisma
model Customer {
  id          String   @id @default(uuid())
  name        String
  sites       Site[]
  createdAt   DateTime @default(now())
}

model Site {
  id          String   @id @default(uuid())
  name        String
  customerId  String
  chargers    Charger[]
  customer    Customer @relation(fields: [customerId], references: [id])
  createdAt   DateTime @default(now())
}

model Charger {
  id          String   @id @default(uuid())
  identifier  String   @unique
  siteId      String
  site        Site     @relation(fields: [siteId], references: [id])
  incidents   Incident[]
  createdAt   DateTime @default(now())
}

model Incident {
  severityLevel   SeverityLevel?   // e.g., Sev3a
  faultReported   String?   // e.g., Long Term Unavailable (LTU)
  rootCause       String?   // free text
  actionTaken     String?   // free text
  inScope         Boolean?  // Yes/No toggle

  id            String   @id @default(uuid())
  title         String
  description   String?
  status        IncidentStatus  @default(OPEN)
  priority      IncidentPriority @default(MEDIUM)
  source        IncidentSource
  tags          Json            @default("[]")        // string[]

  // relationships
  customerId    String?
  customer      Customer? @relation(fields: [customerId], references: [id])
  siteId        String?
  site          Site?     @relation(fields: [siteId], references: [id])
  chargers      Charger[]

  assignedToId  String?         // FK → User
  timeline      TimelineEvent[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum IncidentStatus   { OPEN ACKNOWLEDGED RESOLVED }
enum IncidentPriority { CRITICAL HIGH MEDIUM LOW }
enum IncidentSource   { MANUAL IMPORTED }

enum SeverityLevel {
  SEV0
  SEV1
  SEV1A
  SEV2
  SEV3
}

model TimelineEvent {
  id          String   @id @default(uuid())
  incidentId  String
  authorId    String?
  type        String   // comment | status_change
  payload     Json
  createdAt   DateTime @default(now())
  Incident    Incident @relation(fields:[incidentId], references:[id])
}
```

### 4.2 HTTP API Reference

> Incident creation and updates support linking to `customerId`, `siteId`, and an array of `chargerIds[]` to identify impacted infrastructure. All routes are prefixed with `/api` and secured via Bearer JWT.

| Method    | Path                     | Purpose                                                                                      |
| --------- | ------------------------ | -------------------------------------------------------------------------------------------- |
| **GET**   | `/incidents`             | List (filter by `status`, `priority`, `tag`)                                                 |
| **POST**  | `/incidents`             | Create new incident (accepts title, description, priority, customerId, siteId, chargerIds[]) |
| **GET**   | `/incidents/:id`         | Get incident with timeline                                                                   |
| **PATCH** | `/incidents/:id`         | Update title, priority, assignedToId, status, customerId, siteId, chargerIds[]               |
| **POST**  | `/incidents/:id/comment` | Add timeline comment                                                                         |

Validation should use `zod` schemas in `/src/api/validators`.

### 4.3 Service Workflows

> Incident workflows must validate that provided `customerId`, `siteId`, and each `chargerId` exist before persisting the incident.

#### 4.3.1 Create Incident

- User submits data to `POST /incidents` with optional customer, site, and charger associations
- Service validates payload, creates incident record, logs initial timeline event

#### 4.3.2 Update Status, Assignment, or Associations

- `PATCH /incidents/:id` allows:
  - changing status
  - setting `assignedToId`
  - adding tags

#### 4.3.3 Add Comment

- `POST /incidents/:id/comment` accepts `text`, author inferred from JWT
- Stores timeline entry of type `comment`

### 4.4 Environment Variables (`.env.example`)

```dotenv
# Server
PORT=8080
NODE_ENV=production

# DB
DATABASE_URL=postgresql://user:pass@host:port/db

# Auth
SUPABASE_JWT_SECRET=…
SUPABASE_URL=https://…
```

### 4.5 CI/CD (GitHub Actions)

```yaml
name: CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint && npm run test:ci
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    uses: railwayapp/railway-github-action@v3
    with:
      railwayToken: ${{ secrets.RAILWAY_TOKEN }}
```

---

### 4.6 Pagination & Sorting

- `GET /incidents` supports:
  - `limit`, `offset` for pagination
  - `sortBy`, `sortOrder` for deterministic ordering

### 4.7 Health & Monitoring

- Add `/healthz` endpoint returning 200 JSON
- Prometheus-compatible metrics (latency, count, errors)
- Structured JSON logs to STDOUT for log ingestion

### 4.8 Seed & Fixtures

- Seed script creates demo data:
  - 3 Customers
  - 5 Sites per customer
  - 5 Chargers per site
  - 10 sample Incidents tagged with realistic metadata

### 4.9 Bulk Actions

- Allow multi-select on UI to:
  - Assign multiple incidents to user
  - Add/remove tags in bulk
  - Mass close incidents

### 4.10 Search & Filtering

- Full-text search over:
  - `title`, `rootCause`, `actionTaken`, and `timeline.comment`
- Filterable fields: `status`, `priority`, `severityLevel`, tags, site, customer
- Support saved filters & named views per user (MVP: local browser storage)

