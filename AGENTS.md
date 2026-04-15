# AGENTS.md

This repository supports autonomous coding agents. Follow these rules when making changes.

## Scope

- Keep changes minimal and task-focused.
- Prefer existing patterns, libraries, and file structure.
- Do not add new dependencies unless necessary.

## Repository-Specific Coding Conventions

### Components and UI

- Build UI with existing `src/components` and `src/components/ui` patterns before creating new primitives.
- Keep components focused and composable; move business logic to hooks/services.
- Reuse shadcn/Radix-based components and existing variants instead of introducing parallel UI patterns.

### Modular Boundaries

- `src/pages`: route-level composition and orchestration only.
- `src/hooks`: UI-facing async/state coordination.
- `src/services`: data orchestration, external calls, and backend-facing logic.
- `src/utils`: pure/shared helpers with no UI coupling.
- Avoid cross-layer shortcuts (for example, utility/service modules importing page/component code).

### Styling

- Use Tailwind utilities and existing design tokens/palette.
- Match existing spacing, typography, and variant conventions.
- Avoid ad-hoc CSS files unless no existing utility/component pattern fits.

### Naming Conventions

- Use `PascalCase` for React components, hooks/types/interfaces/enums, and enum type names.
- Use `camelCase` for variables, functions, parameters, and helper methods.
- Use `UPPER_CASE` for true constants (for example config flags).
- Allow leading underscore (`_`) only for intentionally unused args/vars.
- Keep file naming consistent with existing structure: component files in `PascalCase`, utilities/services/hooks in `camelCase`-style exports.

### TypeScript and Data Access

- Keep strict typing intact; avoid `any` unless unavoidable and narrowly scoped.
- Reuse types from `src/integrations/supabase/types.ts` and existing domain types.
- For Supabase queries and relations, follow established normalization/guard patterns in the codebase.

### Testing Expectations

- Add or update tests when behavior changes.
- Prefer targeted unit tests near changed logic (`__tests__` colocated patterns already in repo).
- Keep mocks aligned with existing test style and avoid introducing new test frameworks.
- Maintain healthy coverage for touched areas: if coverage gates fail, add focused tests for the changed or uncovered modules instead of weakening thresholds by default.
- Treat coverage regressions as quality issues to resolve in the same PR unless explicitly approved otherwise.

## Core Commands

- Install: `npm install`
- Dev: `npm run dev`
- Typecheck: `npx tsc --noEmit`
- Lint: `npm run lint`
- Tests: `npm run test -- --run`
- Coverage: `npm run test:coverage`
- Docs: `npm run docs:generate`

## Quality Gate (required before completion)

After edits, run:

1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run test -- --run`

If the task touches documentation tooling, also run `npm run docs:generate`.

## Architecture Notes

- Frontend: React + TypeScript + Vite
- Backend integration: Supabase (`src/integrations/supabase` and `supabase/functions`)
- Service layer: `src/services`
- Hooks layer: `src/hooks`
- Architecture diagrams: `docs/architecture/*.mermaid`

## Database and Migrations

- Put schema changes in `supabase/migrations` with timestamped filenames.
- Keep migrations idempotent and production-safe.

## Safety

- Never commit secrets, tokens, or credentials.
- Avoid destructive operations without explicit approval.
- Do not rewrite unrelated files.

## PR and Review Workflow

- Do not deploy directly from local changes.
- Use PR-first delivery: open a pull request for all changes and merge via the repository workflow.
- After opening a PR, add a comment with `@codex review` to trigger automated code review.

## Database Architecture
The system manages a complex relationship between clinical entities:

Core Entities:

- disease_areas - Medical conditions (e.g., "Breast Cancer", "Lung Cancer")
- parameters - Data points to extract (e.g., "HER2 Status", "Stage")
- trials - Clinical trials with inclusion/exclusion criteria
- prompts - LLM prompts with versioning system
- model_classes - Available AI models
- evals - Evaluation configurations
- eval_runs - Test execution results
Key Relationships:

- trial_disease_areas - Many-to-many: trials can target multiple disease areas
- prompt_model_classes - Many-to-many: prompts can work with multiple models
- prompts - Versioned by (disease_area_id, parameter_id, version) with status tracking
Authentication & Authorization
- Auth Provider: Custom useAuth hook wraps Supabase auth
- User Roles: admin | user with different permissions
- Approval Flow: New users require admin approval before access
- RLS: Database-level Row Level Security enforces permissions
