"""
CSV -> HeatmapDataset JSON geocoder.

Reads a CSV with columns `Organisation`, `Adresse` and one of `Klicks` or
`Events`, geocodes each address via OpenStreetMap Nominatim, and writes a
JSON file that conforms to the HeatmapDataset schema defined in
`app.schema.metrics`.

Nominatim fair-use policy: 1 request/second, unique User-Agent required.
For production, consider swapping to a paid geocoder.

Usage:
    uv run python -m scripts.geocode_csv <input.csv> <output.json> [--trial "Name"]
"""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import sys
import time
from pathlib import Path
from typing import Any

import httpx

from app.schema import HeatmapDataset, HeatmapMeta, HeatmapPoint

NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "reesi-bi-hub/0.1 (contact: jonah@reesi.de)"
RATE_LIMIT_SECONDS = 1.1


def geocode(client: httpx.Client, address: str) -> tuple[float, float, str] | None:
    response = client.get(
        NOMINATIM_URL,
        params={"q": address, "format": "json", "limit": 1, "addressdetails": 1},
        headers={"User-Agent": USER_AGENT},
        timeout=15.0,
    )
    response.raise_for_status()
    hits: list[dict[str, Any]] = response.json()
    if not hits:
        return None
    hit = hits[0]
    return float(hit["lat"]), float(hit["lon"]), hit.get("display_name", address)


def extract_city(address: str) -> str:
    parts = [p.strip() for p in address.split(",")]
    last = parts[-1]
    tokens = last.split()
    if tokens and tokens[0].isdigit():
        return " ".join(tokens[1:]) or last
    return last


def read_rows(csv_path: Path) -> list[dict[str, str]]:
    with csv_path.open("r", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def count_for_row(row: dict[str, str]) -> int:
    for key in ("Klicks", "Events", "Searches", "Suchen"):
        if key in row and row[key].strip():
            try:
                return int(row[key])
            except ValueError:
                continue
    return 0


def convert(csv_path: Path, json_path: Path, trial: str) -> None:
    rows = read_rows(csv_path)
    if not rows:
        print(f"⚠️  '{csv_path}' has no rows.", file=sys.stderr)
        return

    print(f"📍 Geocoding {len(rows)} addresses ...")
    points: list[HeatmapPoint] = []
    failed: list[str] = []

    with httpx.Client() as client:
        for i, row in enumerate(rows, start=1):
            name = (row.get("Organisation") or "").strip()
            address = (row.get("Adresse") or "").strip()
            count = count_for_row(row)

            if not address or address == "—":
                print(f"  [{i}/{len(rows)}] ⏭️  {name}: no address, skipped")
                continue

            try:
                result = geocode(client, address)
            except Exception as exc:
                print(f"  [{i}/{len(rows)}] ❌ {name}: {exc}")
                failed.append(name)
                time.sleep(RATE_LIMIT_SECONDS)
                continue

            if result is None:
                print(f"  [{i}/{len(rows)}] ❌ {name}: no coordinates")
                failed.append(name)
            else:
                lat, lng, _display = result
                points.append(
                    HeatmapPoint(
                        lat=lat,
                        lng=lng,
                        weight=count,
                        name=name,
                        city=extract_city(address),
                        address=address,
                        search_count=count,
                    )
                )
                print(f"  [{i}/{len(rows)}] ✅ {name} ({lat:.4f}, {lng:.4f})")

            time.sleep(RATE_LIMIT_SECONDS)

    points.sort(key=lambda p: p.weight, reverse=True)
    dataset = HeatmapDataset(
        meta=HeatmapMeta(
            trial=trial,
            total_searches=sum(p.search_count for p in points),
            total_sites=len(points),
            generated=dt.date.today().isoformat(),
        ),
        points=points,
    )

    json_path.write_text(dataset.model_dump_json(indent=2), encoding="utf-8")
    print(f"\n✅ Wrote {len(points)} points to '{json_path}'.")
    if failed:
        print(f"⚠️  {len(failed)} failed: {', '.join(failed)}")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("csv_path", type=Path)
    parser.add_argument("json_path", type=Path)
    parser.add_argument("--trial", default="", help="Trial / sponsor label stored in meta.trial")
    args = parser.parse_args()
    convert(args.csv_path, args.json_path, args.trial)


if __name__ == "__main__":
    main()
