from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.routers import health

app = FastAPI(
    title="Reesi Chart API",
    version=__version__,
    description="Middleware for reports.reesi.de — aggregation, charts, PDF export.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)


@app.get("/")
async def root() -> dict[str, str]:
    return {"service": "reesi-api", "version": __version__}
