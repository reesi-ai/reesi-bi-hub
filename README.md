# Reesi BI Hub

**reports.reesi.de** — analytics & customer-report platform for Reesi.

Two use cases, one codebase:
1. **Internal Analytics** — flexible dashboard for the Reesi team
2. **Customer Reports** — reproducible sponsor-specific PDF reports

See [`PLAN.md`](./PLAN.md) for goals, phases, and metric priorities.
See [`AGENTS.md`](./AGENTS.md) for stack, conventions, and the data-adapter pattern.

## Quick start

Prerequisites: Node 20+, npm 10+, Python 3.12, [`uv`](https://github.com/astral-sh/uv), Supabase CLI (optional).

```bash
# Install JS workspaces
npm install

# Install Python deps
cd apps/api && uv sync && cd -

# Run everything
npm run dev                # Next.js on :3000
cd apps/api && uv run fastapi dev    # FastAPI on :8000
```

## Monorepo layout

```
apps/
├── web/          # Next.js 14 — Reesi Design System, Tailwind
└── api/          # FastAPI — adapter pattern, Pydantic schema
packages/
└── shared/       # Shared TS types mirroring the Python schema
supabase/
└── migrations/   # reports schema (cache layer)
```

## Commands

| Scope | Command |
|---|---|
| Install JS deps | `npm install` |
| Frontend dev | `npm run dev -w apps/web` |
| Backend dev | `cd apps/api && uv run fastapi dev` |
| JS lint | `npm run lint` |
| JS typecheck | `npm run typecheck` |
| JS tests | `npm run test` |
| Python lint | `cd apps/api && uv run ruff check .` |
| Python tests | `cd apps/api && uv run pytest` |
