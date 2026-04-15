# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install                  # Install dependencies
npm run dev                  # Start dev server
npx tsc --noEmit             # Type check
npm run lint                 # Lint
npm run test -- --run        # Run tests (non-watch)
npm run test:coverage        # Coverage report
npm run docs:generate        # Generate architecture docs
npx playwright test          # E2E tests (optional, pre-PR)
```

**Quality gate — run before completing any task:**
1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run test -- --run`
4. `npm run test:coverage`

If documentation tooling was touched, also run `npm run docs:generate`.

## Architecture

**Stack:** React + TypeScript + Vite frontend, Supabase backend (DB + Edge Functions)

**Layer boundaries** (no cross-layer shortcuts — e.g., no utility/service importing page/component code):
- `src/pages` — route-level composition only
- `src/hooks` — UI-facing async/state coordination
- `src/services` — data orchestration, external calls, backend-facing logic
- `src/utils` — pure/shared helpers, no UI coupling
- `src/components` / `src/components/ui` — shadcn/Radix-based UI primitives
- `src/integrations/supabase/` — Supabase client, generated types
- `supabase/functions/` — Edge Functions
- `supabase/migrations/` — timestamped, idempotent schema migrations
- `docs/architecture/*.mermaid` — architecture diagrams

**Auth:** Custom `useAuth` hook wraps Supabase auth. Roles: `admin | user`. New users require admin approval. Database-level RLS enforces permissions.

## Database Schema (Core Entities)

| Table | Purpose |
|---|---|
| `disease_areas` | Medical conditions (e.g., "Breast Cancer") |
| `parameters` | Data points to extract (e.g., "HER2 Status") |
| `trials` | Clinical trials with inclusion/exclusion criteria |
| `prompts` | LLM prompts, versioned by `(disease_area_id, parameter_id, version)` with status tracking |
| `model_classes` | Available AI models |
| `evals` | Evaluation configurations |
| `eval_runs` | Test execution results |
| `trial_disease_areas` | Many-to-many: trials ↔ disease areas |
| `prompt_model_classes` | Many-to-many: prompts ↔ models |

## Brand & Design System

**Philosophy:** "Clinical Precision Meets AI Magic" — medical-grade professionalism + AI aesthetics. Apply this system to every visual output: components, pages, artifacts, mockups.

### Colors

**Primary (Orange):**
| Token | Hex | When |
|---|---|---|
| `orange-500` | `#E67635` | Primary CTAs, active states, AI actions |
| `orange-600` | `#C65D21` | Hover states, dark gradient end |
| `orange-400` | `#EF8E58` | Hover on primary |
| `orange-200` | `#FFD3BA` | Tags, subtle highlights |
| `orange-100` | `#FFEFE6` | Tinted surfaces, hover backgrounds |

**Neutrals:** `#222222` (text) → `#383838` → `#515151` → `#626262` → `#7E7E7E` → `#9E9E9E` → `#CFCFCF` → `#E1E1E1` → `#F7F7F7` (page bg). Never use pure `#000000`.

**Semantic:** Success `#22C55E` · Error `#EF4444` · Warning `#F59E0B` · Info `#3B82F6` — only for status, never for brand elements.

### Typography

```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Crimson+Pro:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
```

- **IBM Plex Sans** → UI chrome: buttons, labels, nav, headers, metrics
- **Crimson Pro** → Content: prompts, descriptions, body text, editorial copy

### Visual Language

**Glassmorphism** is the core aesthetic — use for main content cards:
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
}
```

**CTA gradient:** `linear-gradient(135deg, #E67635, #C65D21)` with `box-shadow: 0 4px 20px rgba(230,118,53,0.25)`.

**Border radius:** `6px` (sm) · `10px` (md) · `16px` (lg) · `24px` (xl)

### React / Tailwind

Reesi brand colors are **not** in the Tailwind default palette. Use inline styles or CSS variables — never `className="bg-orange-500"`:

```jsx
// Correct
<button style={{ background: 'linear-gradient(135deg, #E67635, #C65D21)', color: 'white' }}>
// Also fine (Tailwind JIT arbitrary values)
<div className="bg-[#E67635] text-white">
```

---

## Conventions

**TypeScript:** Strict mode; avoid `any`. Reuse types from `src/integrations/supabase/types.ts`.

**Naming:**
- `PascalCase` — React components, hooks, types, interfaces, enums
- `camelCase` — variables, functions, parameters, service/hook file exports
- `UPPER_CASE` — true constants/config flags
- `_leadingUnderscore` — intentionally unused args/vars only
- Component files: `PascalCase`; utility/service/hook files: `camelCase`-style

**Styling:** Tailwind utilities and existing design tokens. Match existing spacing/typography/variant conventions. No ad-hoc CSS files unless no existing pattern fits.

**Tests:** Colocated in `__tests__` directories. Unit tests near changed logic. Do not weaken coverage thresholds — fix regressions in the same PR.

**Migrations:** Timestamped filenames in `supabase/migrations/`. Keep idempotent and production-safe.

## Deployment

**App (Hetzner):** Triggered automatically on push to `main` via `.github/workflows/deploy.yml`.

CI gate (must pass before deploy):
```
npm ci → agents:validate → filesize:check → bundle:check → lint → docs:generate → test:coverage → test:timed
```
Deploy: SSH to Hetzner, updates `/var/www/prompts-app` to `origin/main`, runs `npm ci && npm run build`, reloads Caddy via `systemctl reload caddy`.

**Database Migrations (Supabase):** Via `.github/workflows/supabase-migrations.yml`.
- Triggers: `workflow_dispatch` (manual) or push to `main` with commit message containing `[run-migrations]`
- Requires secret: `SUPABASE_DB_URL` (session pooler, `sslmode=require`)
- Do **not** use `--include-all` in CI unless intentionally backfilling old local migration files.

**Release sequence:**
1. Merge feature PR to `main`
2. Confirm `Deploy to Hetzner` workflow is green
3. If schema changed: run `Deploy Supabase Migrations`
4. Smoke test: auth/login, prompts list + edit, playground run, eval run creation, Medical Model disease area open/edit/publish

**Rollback:**
- App: revert the commit on `main` and push — CI redeploys automatically
- Migrations: create a forward-fix migration; never mutate old files. Run corrective SQL manually in Supabase if needed, then capture in a new migration.

## PR Workflow

Open a PR for all changes (no direct local deploys). After opening, comment `@codex review` to trigger automated code review.
