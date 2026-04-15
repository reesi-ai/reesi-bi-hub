'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import {
  type GermanyGeoJSON,
  type HeatmapDataset,
  type ThemeName,
  THEMES,
  renderHeatmap,
} from '@/lib/heatmap';

const BASE_WIDTH = 900;
const BASE_HEIGHT = 1100;

export interface HeatmapGermanyProps {
  dataset: HeatmapDataset;
  /** Path to the Bundesländer GeoJSON. Defaults to the vendored file in /public. */
  geoJsonUrl?: string;
  theme?: ThemeName;
  radius?: number;
  intensity?: number;
  opacity?: number;
  /** Show the interactive controls sidebar. Defaults to true. */
  showControls?: boolean;
  /** Rendered export filename stem. */
  exportName?: string;
}

interface Controls {
  theme: ThemeName;
  radius: number;
  intensity: number;
  opacity: number;
  exportResolution: 1 | 2 | 3 | 4;
}

export function HeatmapGermany({
  dataset,
  geoJsonUrl = '/germany-states.geo.json',
  theme = 'brand',
  radius = 25,
  intensity = 1.2,
  opacity = 0.85,
  showControls = true,
  exportName = 'reesi-heatmap',
}: HeatmapGermanyProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [statesGeoJSON, setStatesGeoJSON] = useState<GermanyGeoJSON | null>(null);
  const [loadingGeo, setLoadingGeo] = useState(true);
  const [controls, setControls] = useState<Controls>({
    theme,
    radius,
    intensity,
    opacity,
    exportResolution: 3,
  });

  useEffect(() => {
    let cancelled = false;
    fetch(geoJsonUrl)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancelled) setStatesGeoJSON(json as GermanyGeoJSON | null);
      })
      .catch(() => {
        if (!cancelled) setStatesGeoJSON(null);
      })
      .finally(() => {
        if (!cancelled) setLoadingGeo(false);
      });
    return () => {
      cancelled = true;
    };
  }, [geoJsonUrl]);

  const themeObject = useMemo(() => THEMES[controls.theme], [controls.theme]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, forExport: boolean) => {
      renderHeatmap(ctx, dataset.points, {
        width: BASE_WIDTH,
        height: BASE_HEIGHT,
        radius: controls.radius,
        intensity: controls.intensity,
        opacity: controls.opacity,
        theme: themeObject,
        statesGeoJSON,
        watermark: forExport,
      });
    },
    [dataset.points, controls, themeObject, statesGeoJSON],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = BASE_WIDTH;
    canvas.height = BASE_HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    draw(ctx, false);
  }, [draw]);

  const handleExport = useCallback(() => {
    const scale = controls.exportResolution;
    const outCanvas = document.createElement('canvas');
    outCanvas.width = BASE_WIDTH * scale;
    outCanvas.height = BASE_HEIGHT * scale;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(scale, scale);
    draw(ctx, true);
    const link = document.createElement('a');
    link.download = `${exportName}_${scale}x_${BASE_WIDTH * scale}x${BASE_HEIGHT * scale}.png`;
    link.href = outCanvas.toDataURL('image/png');
    link.click();
  }, [controls.exportResolution, draw, exportName]);

  const totalSearches = useMemo(
    () => dataset.points.reduce((sum, p) => sum + p.search_count, 0),
    [dataset.points],
  );

  return (
    <div className="flex w-full flex-col gap-6 md:flex-row">
      <div className="relative flex-1 overflow-hidden rounded-[16px] bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)] ring-1 ring-black/5">
        {loadingGeo && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E67635]/20 border-t-[#E67635]" />
            <p className="text-sm text-ink-700">Karte wird geladen…</p>
          </div>
        )}
        <canvas
          ref={canvasRef}
          className="block h-auto w-full"
          style={{ aspectRatio: `${BASE_WIDTH} / ${BASE_HEIGHT}` }}
        />
      </div>

      {showControls && (
        <aside className="glass-card flex w-full shrink-0 flex-col gap-6 p-6 md:w-[340px]">
          <header>
            <h3 className="font-ui text-lg font-semibold text-ink-950">{dataset.meta.trial}</h3>
            <p className="mt-1 text-xs text-ink-600">
              Generiert am {dataset.meta.generated} · Datenquelle {dataset.meta.total_sites}{' '}
              Standorte
            </p>
          </header>

          <div className="grid grid-cols-2 gap-3">
            <Stat value={dataset.meta.total_sites} label="Standorte" />
            <Stat value={totalSearches} label="Suchen" />
          </div>

          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-600">
              Suchintensität
            </div>
            <div
              className="h-2.5 rounded-full"
              style={{ background: themeObject.gradientCss }}
              aria-hidden
            />
            <div className="mt-1 flex justify-between text-[10px] text-ink-500">
              <span>Niedrig</span>
              <span>Hoch</span>
            </div>
          </div>

          <Slider
            label="Radius"
            min={8}
            max={80}
            step={1}
            value={controls.radius}
            onChange={(v) => setControls((c) => ({ ...c, radius: v }))}
          />
          <Slider
            label="Intensität"
            min={0.3}
            max={5}
            step={0.1}
            value={controls.intensity}
            onChange={(v) => setControls((c) => ({ ...c, intensity: v }))}
            format={(v) => v.toFixed(1)}
          />
          <Slider
            label="Deckkraft"
            min={0.2}
            max={1}
            step={0.05}
            value={controls.opacity}
            onChange={(v) => setControls((c) => ({ ...c, opacity: v }))}
            format={(v) => v.toFixed(2)}
          />

          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-600">
              Farbschema
            </div>
            <div className="flex gap-2">
              {(['brand', 'cool', 'plasma'] as const).map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setControls((c) => ({ ...c, theme: name }))}
                  className={`flex-1 rounded-md border px-2 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                    controls.theme === name
                      ? 'border-[#E67635] bg-[#FFEFE6] text-[#C65D21]'
                      : 'border-ink-200 bg-white/60 text-ink-700 hover:bg-white'
                  }`}
                >
                  {name === 'brand' ? 'Reesi' : name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-600">
              Export-Auflösung
            </div>
            <div className="flex gap-1.5">
              {([1, 2, 3, 4] as const).map((res) => (
                <button
                  key={res}
                  type="button"
                  onClick={() => setControls((c) => ({ ...c, exportResolution: res }))}
                  className={`flex-1 rounded border px-1 py-1.5 text-xs font-semibold transition ${
                    controls.exportResolution === res
                      ? 'border-[#E67635] bg-[#FFEFE6] text-[#C65D21]'
                      : 'border-ink-200 bg-white/60 text-ink-600 hover:bg-white'
                  }`}
                >
                  {res}×
                </button>
              ))}
            </div>
          </div>

          <button type="button" onClick={handleExport} className="btn-primary">
            PNG exportieren
          </button>
        </aside>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-[10px] border border-ink-200 bg-white/60 p-3 text-center">
      <div className="bg-gradient-to-br from-[#E67635] to-[#C65D21] bg-clip-text text-2xl font-bold text-transparent">
        {value.toLocaleString('de-DE')}
      </div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wider text-ink-500">{label}</div>
    </div>
  );
}

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
}

function Slider({ label, min, max, step, value, onChange, format }: SliderProps) {
  return (
    <div>
      <label className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-ink-600">
        <span>{label}</span>
        <span className="rounded bg-[#FFEFE6] px-2 py-0.5 text-xs font-semibold text-[#C65D21]">
          {format ? format(value) : value}
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="reesi-range w-full"
      />
    </div>
  );
}
