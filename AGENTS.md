# AGENTS.md

This file provides guidance to coding agents (Claude Code, Codex, etc.) working in this repository.

## Project

**reports.reesi.de** — internal analytics & customer-report platform. Two use cases:

1. **Internal Analytics** — flexible dashboard for the Reesi team
2. **Customer Reports** — reproducible sponsor-specific PDF reports

See `PLAN.md` for full goals, phases, and metric priorities.

**Leitmotiv:** Scope small, extend continuously. Every phase production-ready on its own.

## Repo Layout

Monorepo (npm workspaces):

```
reesi-bi-hub/
├── apps/
│   ├── web/          # Next.js 14 frontend (TypeScript, Tailwind)
│   └── api/          # Python FastAPI middleware (uv)
├── packages/
│   └── shared/       # Shared TS types — normalized data schema
├── supabase/
│   └── migrations/   # reports schema (cache tables)
├── .github/workflows/
├── AGENTS.md
├── PLAN.md
└── package.json      # npm workspaces root
```

## Stack

| Layer | Tech | Notes |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind | Reesi Design System (orange + neutrals, IBM Plex Sans + Crimson Pro, glassmorphism) |
| Chart API | Python 3.12 + FastAPI | Aggregation, chart generation, PDF export |
| Data Adapter Layer | Python (Adapter Pattern) | `data_source.py` interface; `bubble_adapter.py` now, `supabase_adapter.py` in 2–3 months |
| Data Sources | Bubble API · Supabase · Plausible | Swappable via adapter layer |
| Cache | Supabase `reports` schema | Nightly for dashboards, on-demand for sponsor reports |
| PDF | Puppeteer (headless Chrome) | Pixel-perfect, reproducible |

## Commands

### Root (monorepo)
```bash
npm install                  # Install all JS workspaces
npm run lint                 # Lint all workspaces
npm run typecheck            # tsc --noEmit across workspaces
npm run test                 # Jest across workspaces
```

### Frontend (`apps/web`)
```bash
npm run dev -w apps/web      # Next.js dev server
npm run build -w apps/web    # Production build
```

### Backend (`apps/api`)
```bash
cd apps/api
uv sync                      # Install Python deps
uv run fastapi dev           # Dev server
uv run pytest                # Tests
uv run ruff check .          # Lint
uv run ruff format .         # Format
```

## Quality Gate (before completion)

1. `npm run typecheck`
2. `npm run lint`
3. `npm run test`
4. For Python changes: `uv run ruff check . && uv run pytest`

## Core Principles

### Data Adapter Pattern (non-negotiable)

The data source is **only** accessed through the adapter interface in `apps/api/app/adapters/data_source.py`. All business logic, chart generation, and API endpoints consume the adapter interface — never Bubble/Supabase clients directly. This is what makes the Bubble → Supabase migration a one-file change.

### Normalized Schema

Every adapter returns data in the same shape (fields: `month`, `clicks`, `sponsor_id`, `study_id`, etc.). This schema is defined in `packages/shared/` and mirrored in `apps/api/app/schema/`. When you change one, change the other.

### Scope Discipline

- **No new customer-report modules without Christoph approval.**
- **No new metrics without documented definition + stakeholder sign-off** (Salma, Christoph, Christian).
- Every metric needs: plain-language definition, Bubble fields, aggregation logic, time granularity, relevance tier.

### Caching Tiers

- **Nightly cache** — dashboard metrics, written to Supabase `reports` schema
- **On-demand cache** — sponsor-report data, 24h TTL or manual invalidation
- **No cache** — MCP ad-hoc queries only (accept token costs)

## Reesi Brand (UI)

**Philosophy:** "Clinical Precision Meets AI Magic"

### Colors
- **Primary:** `#E67635` (orange-500) for CTAs / AI actions, hover `#EF8E58`, dark `#C65D21`
- **CTA gradient:** `linear-gradient(135deg, #E67635, #C65D21)` + `box-shadow: 0 4px 20px rgba(230,118,53,0.25)`
- **Neutrals:** `#222222` (text) · `#626262` (secondary) · `#F7F7F7` (page bg). Never pure `#000000`.
- **Brand tints:** `#FFEFE6` (bg) · `#FFD3BA` (tags)
- **Semantic:** `#22C55E` success · `#EF4444` error · `#F59E0B` warning · `#3B82F6` info — status only, never brand

### Typography
```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
```
- **IBM Plex Sans** — UI chrome (buttons, labels, nav, metrics)
- **Crimson Pro** — content (prompts, descriptions, editorial)

### Glassmorphism (core card pattern)
```css
background: rgba(255,255,255,0.7);
backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255,255,255,0.5);
border-radius: 16px;
box-shadow: 0 4px 24px rgba(0,0,0,0.06);
```

### Tailwind note
Reesi colors are **not** in the Tailwind default palette. Use arbitrary values or CSS variables:
```jsx
<div className="bg-[#E67635]">         // ✅
<div className="bg-orange-500">        // ❌ (Tailwind's orange, not Reesi's)
```

Brand tokens live in `apps/web/src/styles/brand.css` as CSS custom properties.

## Conventions

### TypeScript
- Strict mode; avoid `any`
- Shared types live in `packages/shared/` — frontend and adapter schema stay in sync via this package

### Python
- Ruff for lint + format (`ruff check`, `ruff format`)
- Type hints on all public functions
- Pydantic models for adapter returns — enforces the normalized schema at runtime

### Naming
- **TS:** `PascalCase` components/types/hooks · `camelCase` vars/functions · `UPPER_CASE` constants
- **Python:** `snake_case` modules/functions · `PascalCase` classes · `UPPER_CASE` constants

### Commits
Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`).

### PRs
- PR-first delivery — no direct pushes to `main` from local
- After opening a PR, comment `@codex review` to trigger automated review
- Required reviewer for first production deploys: Tosan or Johannes

## Engineering Hygiene (Day 1)

- ESLint + Prettier (JS/TS), Ruff (Python) — CI fails on errors
- Jest (JS) / pytest (Python) from start
- **Coverage ≥ 70%** before production
- `jscpd` — duplicate code detection
- `dependency-cruiser` — enforce layer boundaries
- `knip` — dead code / unused deps

## Safety

- No secrets in commits. Use `.env.local` (gitignored)
- No destructive DB operations without explicit approval
- Migrations: timestamped, idempotent, production-safe, only in `supabase/migrations/`
- Forward-fix migrations only — never mutate existing migration files

## Open Questions (check `PLAN.md` for owners)

- Patient DB data privacy (Tosan)
- Bubble API limits & workflow units (Jonah + Bubble)
- Final customer-report module list (Christoph)
