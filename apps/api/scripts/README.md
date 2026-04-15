# scripts/

Utility scripts run via `uv run python -m scripts.<name>` from `apps/api/`.

## geocode_csv.py

Converts a CSV (`Organisation`, `Adresse`, `Klicks|Events`) into a
`HeatmapDataset` JSON compatible with `apps/web/src/lib/heatmap`.

```bash
uv run python -m scripts.geocode_csv input.csv output.json --trial "Pfizer"
```

**Note:** Uses OpenStreetMap Nominatim (free, rate-limited to 1 req/s).
For large batches, plug in a paid geocoder (Mapbox, Google) by replacing
the `geocode()` function.
