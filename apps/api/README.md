# apps/api — Chart API

Python / FastAPI middleware for reports.reesi.de.

## Setup

```bash
uv sync                      # Install deps into .venv
uv run fastapi dev           # Dev server (http://localhost:8000)
```

## Scripts

```bash
uv run pytest                # Run tests
uv run ruff check .          # Lint
uv run ruff format .         # Format
uv run mypy app              # Type check
```

## Structure

```
apps/api/
├── app/
│   ├── main.py              # FastAPI entry
│   ├── adapters/            # Data adapter layer (only layer that changes on DB switch)
│   │   ├── data_source.py   # Protocol — every adapter implements this
│   │   └── bubble_adapter.py
│   ├── routers/             # HTTP routes
│   └── schema/              # Pydantic models — normalized data schema
└── tests/
```

See root `AGENTS.md` for the adapter pattern rationale.
