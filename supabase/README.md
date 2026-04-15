# supabase/

Supabase config and migrations for the `reports` schema (cache layer).

## Schema policy

- **`public`** — owned by the existing Reesi Supabase project, not managed here
- **`reports`** — cache tables for dashboards and customer reports, owned by this repo

## Migrations

```bash
supabase db push                          # Apply pending migrations to linked project
supabase migration new <name>             # Create a new timestamped migration
supabase migration list                   # See local + remote state
```

**Rules:**
- Forward-fix only — never mutate existing migration files
- Keep migrations idempotent (`create ... if not exists`)
- Production-safe — no data loss
- One purpose per migration
