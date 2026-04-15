# PLAN.md — reports.reesi.de
> Analytics & Reporting Platform · Version 1.0 · April 2026

---

## Goal

Build a standalone internal web app at **reports.reesi.de** serving two distinct use cases:

1. **Internal Analytics** — flexible, fast-iteration dashboard for the Reesi team
2. **Customer Reports** — reproducible, sponsor-specific PDF reports for sponsors

The current Analytics setup in Bubble is too tightly coupled with product logic, hard to extend, and not suited for customer-facing reports.

**Leitmotiv: Scope small, extend continuously. Every phase must be production-ready on its own. No big-bang release.**

---

## Architecture

### 3-Layer Model

| Layer | Technology | Responsibility |
|---|---|---|
| **Frontend** | React / Next.js | UI, configuration, chart rendering, PDF export |
| **Chart API (Middleware)** | Python / FastAPI | Business logic, aggregation, chart generation |
| **Data Adapter Layer** | Python (Adapter Pattern) | Data source abstraction — only this changes on DB switch |
| **Data Sources** | Bubble API / Supabase / Plausible | Raw data — swappable without affecting upper layers |

### Data Adapter Layer (Key to DB Migration)

The Data Adapter Layer fully encapsulates the data source. On migration from Bubble to Supabase, **only this layer is replaced**.

| Component | Description |
|---|---|
| `bubble_adapter.py` | Normalizes Bubble's nested JSON, handles pagination, maps fields to unified schema |
| `supabase_adapter.py` | Replaces bubble_adapter.py in 2–3 months, returns the same data format |
| `data_source.py` | Interface definition — defines which methods every adapter must implement |
| Normalized Schema | Defined once now, becomes the Supabase schema in 3 months. Fields: `month`, `clicks`, `sponsor_id`, `study_id`, etc. |

### Caching Strategy

- **Nightly Cache** — monthly metrics (signups, clicks, searches): updated once daily, stored in Supabase `reports` schema
- **On-Demand Cache** — sponsor-specific data for customer reports: fetched on first request, invalidated after 24h or manual trigger
- **No Cache** — ad-hoc requests via MCP: direct Bubble API calls, token costs accepted

### Bubble API vs. Buildprint MCP

**Recommendation: Hybrid approach.**
- Bubble API for all defined report metrics (reliable, cacheable, deterministic)
- Buildprint MCP for ad-hoc queries via chat interface only

---

## Data Sources & Metrics

### Data Sources

| Source | Status |
|---|---|
| **Bubble** | API set up, nested structure → Adapter needed. Primary source for all current metrics. |
| **Supabase Trial DB** | Direct access via Supabase Client. Clarify needed fields with Tosan. |
| **Supabase Patient DB** | Requires data privacy clarification with Tosan. Interest: registrations per indication, letter/questionnaire split, patient status. |
| **Plausible.io** | Web analytics API. Pageviews, sessions, traffic sources. Simple REST API. |
| **Survey (Internal Tools)** | Already in Supabase Internal Tools. Direct DB access for questionnaire tracking. |

### Metrics Priority

| Metric | Source | Update Logic | Priority |
|---|---|---|---|
| User Signups per month (cumulative & monthly) | Bubble | Nightly Cache | **MVP** |
| Distribution User Types | Bubble | Nightly Cache | **MVP** |
| Searches per month total | Bubble | Nightly Cache | **MVP** |
| Trial Clicks per month (cumulative) | Bubble | Nightly Cache | **MVP** |
| Clicks per Trial / Study | Bubble | Nightly Cache | **MVP** |
| Logins per month (cumulative) | Bubble | Nightly Cache | **MVP** |
| Searches by Indication | Bubble | Nightly Cache | **V1** |
| Trial Split by Indication | Bubble | Nightly Cache | **V1** |
| Regional Distribution (Heatmap) | Bubble | On-Demand | **V1** |
| HCP Split Clinic vs. Outpatient | Bubble | Nightly Cache | **V1** |
| Claimed Yes/No Distribution | Bubble | Nightly Cache | **V1** |
| Search Edits / Search Sources | Bubble | Nightly Cache | **V1** |
| Patient Registrations per Indication | Supabase Patient | On-Demand | **V2** |
| Letter / Questionnaire Split | Supabase Patient | On-Demand | **V2** |
| Searches by Super-Indication | Bubble | Nightly Cache | **V2** |

> **For each metric, Jonah must document:** Plain-language definition · Bubble fields and tables · Aggregation logic · Time granularity · Relevance (must have / nice to have / drop). Implementation only after stakeholder alignment (Salma, Christoph, Christian).

---

## Customer Reports

### MVP Report Flow

1. Select sponsor (dropdown from DB)
2. Select studies (filtered by sponsor)
3. Select time period (month picker)
4. Select modules (checkboxes, based on existing reports)
5. Generate PDF — direct browser download

**Rule: No new modules without Christoph approval. No scope creep.**

### PDF Export

**Recommended: Puppeteer (headless Chrome)** — pixel-perfect HTML/CSS → PDF, full design control.

Minimum requirements:
- Clean layout per Reesi Design System (colors, fonts, logo)
- Sponsor and time period visible on every page
- Clear module structure with dividers
- Charts embedded as high-resolution PNG
- Reproducible: same inputs → identical PDF
- Zero manual post-processing

---

## Development Plan

### Phase 1 — Discovery & Alignment (Week 1–2)

- [ ] Walk through Reesi Admin Analytics completely — capture all charts, take screenshots
- [ ] For each metric: document definition, Bubble fields, aggregation logic, relevance
- [ ] Analyze existing customer reports as reference (Roche PDF + Q4 presentation)
- [ ] Stakeholder interviews: Salma (usage), Christoph (customer reports), Christian (tech alignment)
- [ ] **Deliverable:** Prioritized metric list (must have / nice to have / drop) — written and fixed
- [ ] **Gate:** Christian sign-off before Phase 2 starts

### Phase 2 — Foundation & Data Layer (Week 2–3)

- [ ] Create GitHub repo (`reports.reesi.de`) in Reesi team — enable tooling immediately
- [ ] Tooling: ESLint, Prettier, Jest, jscpd, dependency-cruiser, knip, `agents.md`
- [ ] Create Supabase schema `reports` — cache tables, no separate user table
- [ ] Bubble API: finalize decision API vs. MCP, implement `bubble_adapter.py`
- [ ] Define normalized data schema — this becomes the Supabase schema in 3 months
- [ ] Get first Bubble fetch for one metric end-to-end (Proof of Concept)
- [ ] **Gate:** Data arrives cleanly, schema is documented

### Phase 3 — MVP Analytics Dashboard (Week 3–5)

- [ ] Set up Next.js app with Reesi Design System — deploy to `reports.reesi.de`
- [ ] Connect auth via existing Supabase Internal Tools user auth
- [ ] Implement MVP metrics: User Signups, Searches, Trial Clicks (cumulative + monthly)
- [ ] Build chart components — reusable, parameterizable
- [ ] Sponsor / study / time period filters in UI
- [ ] Implement nightly cache job (Bubble → Supabase `reports` schema)
- [ ] **Gate:** Dashboard is live, metrics are correct, Christoph + Christian sign-off

### Phase 4 — Customer Report MVP (Week 5–8)

- [ ] Report configuration UI: Sponsor → Studies → Time Period → Modules
- [ ] Structure modules 1:1 per existing Roche report (align with Christoph)
- [ ] Chart generation for report view (PNG export from chart components)
- [ ] Implement PDF export via Puppeteer — Roche as first test candidate
- [ ] Layout: Reesi Design System, logo, page structure, reproducible
- [ ] Internal review: Christoph approves report before proceeding
- [ ] **Gate:** Roche report can be generated completely and cleanly as PDF

### Phase 5 — Extensions & V1 Metrics (Week 8–12)

- [ ] Implement V1 metrics from priority list (indication, heatmap, HCP split)
- [ ] Connect Trial Database (clarify with Tosan, direct Supabase Client)
- [ ] Additional sponsor reports — generically derivable from Phase 4 components
- [ ] Ad-hoc interface (optional): chat-based via Buildprint MCP for exploratory queries
- [ ] Connect Plausible.io for web analytics metrics
- [ ] **Gate:** Team can generate reports independently without tech involvement

### Phase 6 — Supabase Migration & V2 (Month 3–4)

- [ ] Bubble → Supabase migration: replace only `bubble_adapter.py` with `supabase_adapter.py`
- [ ] All chart components and business logic remain unchanged
- [ ] Connect Patient Database — after data privacy clarification with Tosan
- [ ] V2 metrics: patient registrations, letter/questionnaire split
- [ ] Performance optimizations, extended caching strategy
- [ ] **Gate:** Migration complete, all metrics as before, no regression

---

## Engineering Hygiene

### Tooling (from Day 1)

- **ESLint + Prettier** — linting enforced, CI fails on errors
- **Jest** — unit and integration tests from the start
- **Test Coverage Threshold** — minimum 70% before production
- **jscpd** — duplicate code detection, prevents copy-paste architecture
- **dependency-cruiser** — modular dependency rules
- **knip** — dead code and unused dependency detection
- **agents.md** — agentic-first architecture from day one

### Deployment Workflow

- Development in dev environment, commits traceable (Conventional Commits)
- PR template active — automatic documentation
- Before every production deploy: Codex Code Review (`@codex review`)
- Review with Tosan or Johannes before first production deploy

---

## Open Questions

| Question | Owner | Detail | Priority |
|---|---|---|---|
| Patient Database data privacy | Tosan | Which fields, anonymization, GDPR compliance | **Critical** |
| Bubble API limits & workflow units | Jonah + Bubble | Estimate costs for nightly cache jobs | **Critical** |
| Customer report modules (final) | Christoph | Which modules are required vs. optional | **Critical** |
| Buildprint MCP capabilities | Jonah + Buildprint | What can MCP realistically do for ad-hoc | **V1** |
| Plausible API access | Jonah | API key, which metrics available | **V1** |
| Monthly vs. quarterly report | Christoph | Separate UI or one flexible report | **V1** |

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Bubble API aggregations insufficient (cumulative counting not native) | Move aggregation logic into Data Adapter Layer — not a blocker, just extra work |
| PDF export layout inconsistencies across browsers/servers | Pin Puppeteer to fixed Chrome version, CI tests with screenshot comparison |
| Scope creep in customer reports (new modules without alignment) | Hard rule: new modules only with Christoph approval. Guard in code with feature flags |
| Patient Database data privacy blocks V2 timeline | Start V2 metrics without Patient DB, treat as separate ticket when clarification arrives |
| Supabase migration in 3 months delayed | Not a problem thanks to adapter pattern — Bubble adapter keeps running, migration is decoupled |
| MCP token costs with frequent use | MCP only for ad-hoc, clear rate limiting, no MCP for batch reports |

---

## Glossary

| Term | Definition |
|---|---|
| **Data Adapter Layer** | Layer that abstracts data sources. `bubble_adapter.py` vs. `supabase_adapter.py` — both return the same data format to the chart logic above |
| **Normalized Schema** | Unified data format all adapters must output. Defines the "language" between data sources and chart logic |
| **Nightly Cache** | Daily job that aggregates Bubble data and stores it in the Supabase `reports` schema. Makes dashboards fast and reduces Bubble API calls |
| **Customer Report** | Reproducible, sponsor-specific report as PDF. Based on existing manual reports. Modules aligned with Christoph |
| **Internal Analytics** | Flexible internal dashboard for the Reesi team. No fixed format, focus on correctness and iterability |
| **MCP (Buildprint)** | Model Context Protocol — enables LLM-based Bubble queries for ad-hoc analysis without predefined SQL queries |
