import { geoToCanvas } from './projection';
import type { ColorStop, GermanyGeoJSON, HeatmapPoints, RenderOptions } from './types';

const BASE_WIDTH = 900;

function tracePolygonOuterRing(
  ctx: CanvasRenderingContext2D,
  rings: number[][][],
  width: number,
  height: number,
): void {
  const outer = rings[0];
  if (!outer) return;
  ctx.beginPath();
  for (let i = 0; i < outer.length; i += 1) {
    const coord = outer[i];
    if (!coord) continue;
    const [lng, lat] = coord as [number, number];
    const [x, y] = geoToCanvas(lng, lat, width, height);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

function traceAllRings(
  ctx: CanvasRenderingContext2D,
  rings: number[][][],
  width: number,
  height: number,
): void {
  for (const ring of rings) {
    ctx.beginPath();
    for (let i = 0; i < ring.length; i += 1) {
      const coord = ring[i];
      if (!coord) continue;
      const [lng, lat] = coord as [number, number];
      const [x, y] = geoToCanvas(lng, lat, width, height);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }
}

function forEachPolygon(
  geojson: GermanyGeoJSON,
  callback: (rings: number[][][]) => void,
): void {
  for (const feature of geojson.features) {
    const geom = feature.geometry;
    if (geom.type === 'MultiPolygon') {
      for (const polygon of geom.coordinates) callback(polygon);
    } else {
      callback(geom.coordinates);
    }
  }
}

function drawBundeslaender(
  ctx: CanvasRenderingContext2D,
  geojson: GermanyGeoJSON,
  width: number,
  height: number,
): void {
  ctx.save();
  forEachPolygon(geojson, (rings) => {
    tracePolygonOuterRing(ctx, rings, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  });
  forEachPolygon(geojson, (rings) => {
    traceAllRings(ctx, rings, width, height);
    ctx.strokeStyle = '#3a3a3a';
    ctx.lineWidth = 1;
    ctx.lineJoin = 'round';
    ctx.stroke();
  });
  ctx.restore();
}

function buildClipMask(
  geojson: GermanyGeoJSON,
  width: number,
  height: number,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  ctx.fillStyle = '#000';
  forEachPolygon(geojson, (rings) => {
    tracePolygonOuterRing(ctx, rings, width, height);
    ctx.fill();
  });
  return canvas;
}

function interpolateStops(intensity: number, stops: ColorStop[]): [number, number, number, number] {
  let lo = stops[0]!;
  let hi = stops[stops.length - 1]!;
  for (let i = 0; i < stops.length - 1; i += 1) {
    const current = stops[i]!;
    const next = stops[i + 1]!;
    if (intensity >= current[0] && intensity <= next[0]) {
      lo = current;
      hi = next;
      break;
    }
  }
  const t = hi[0] === lo[0] ? 0 : (intensity - lo[0]) / (hi[0] - lo[0]);
  return [
    Math.round(lo[1][0] + t * (hi[1][0] - lo[1][0])),
    Math.round(lo[1][1] + t * (hi[1][1] - lo[1][1])),
    Math.round(lo[1][2] + t * (hi[1][2] - lo[1][2])),
    lo[1][3] + t * (hi[1][3] - lo[1][3]),
  ];
}

function drawHeatmap(
  ctx: CanvasRenderingContext2D,
  points: HeatmapPoints,
  options: RenderOptions,
): void {
  const { width, height, radius, intensity, opacity, theme, statesGeoJSON } = options;
  if (points.length === 0) return;

  const heatCanvas = document.createElement('canvas');
  heatCanvas.width = width;
  heatCanvas.height = height;
  const heatCtx = heatCanvas.getContext('2d');
  if (!heatCtx) return;

  const maxWeight = Math.max(...points.map((p) => p.weight));
  if (maxWeight <= 0) return;

  const scaledRadius = radius * (width / BASE_WIDTH) * 1.2;

  for (const point of points) {
    const [x, y] = geoToCanvas(point.lng, point.lat, width, height);
    const nw = Math.min((point.weight / maxWeight) * intensity, 1);
    const gradient = heatCtx.createRadialGradient(x, y, 0, x, y, scaledRadius);
    gradient.addColorStop(0, `rgba(0,0,0,${nw})`);
    gradient.addColorStop(0.35, `rgba(0,0,0,${Math.min(nw * 0.65, 0.65)})`);
    gradient.addColorStop(0.7, `rgba(0,0,0,${Math.min(nw * 0.2, 0.2)})`);
    gradient.addColorStop(1, 'rgba(0,0,0,0)');

    heatCtx.fillStyle = gradient;
    heatCtx.fillRect(x - scaledRadius, y - scaledRadius, scaledRadius * 2, scaledRadius * 2);
  }

  const image = heatCtx.getImageData(0, 0, width, height);
  const pixels = image.data;
  const stops = theme.stops;
  for (let i = 0; i < pixels.length; i += 4) {
    const a = pixels[i + 3] ?? 0;
    const localIntensity = a / 255;
    if (localIntensity < 0.008) {
      pixels[i + 3] = 0;
      continue;
    }
    const [r, g, b, finalA] = interpolateStops(localIntensity, stops);
    pixels[i] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
    pixels[i + 3] = Math.round(finalA * opacity);
  }
  heatCtx.putImageData(image, 0, 0);

  if (statesGeoJSON) {
    const mask = buildClipMask(statesGeoJSON, width, height);
    const maskCtx = mask.getContext('2d');
    if (maskCtx) {
      maskCtx.globalCompositeOperation = 'source-in';
      maskCtx.drawImage(heatCanvas, 0, 0);
      ctx.drawImage(mask, 0, 0);
      return;
    }
  }
  ctx.drawImage(heatCanvas, 0, 0);
}

function drawBorderOverlay(
  ctx: CanvasRenderingContext2D,
  geojson: GermanyGeoJSON,
  width: number,
  height: number,
  crisp: boolean,
): void {
  ctx.save();
  forEachPolygon(geojson, (rings) => {
    traceAllRings(ctx, rings, width, height);
    ctx.strokeStyle = 'rgba(40, 40, 40, 0.5)';
    ctx.lineWidth = crisp ? 1.2 : 0.8;
    ctx.lineJoin = 'round';
    ctx.stroke();
  });
  ctx.restore();
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
): void {
  const scale = width / BASE_WIDTH;
  const fontSize = Math.round(14 * scale);
  ctx.font = `500 ${fontSize}px "IBM Plex Sans", system-ui, sans-serif`;
  ctx.fillStyle = '#aab2be';
  ctx.textAlign = 'center';
  ctx.fillText('Reesi BI Hub', width / 2, height - 20 * scale);
}

export function renderHeatmap(
  ctx: CanvasRenderingContext2D,
  points: HeatmapPoints,
  options: RenderOptions,
): void {
  const { width, height, statesGeoJSON, watermark } = options;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  if (statesGeoJSON) {
    drawBundeslaender(ctx, statesGeoJSON, width, height);
  }

  drawHeatmap(ctx, points, options);

  if (statesGeoJSON) {
    drawBorderOverlay(ctx, statesGeoJSON, width, height, Boolean(watermark));
  }

  if (watermark) {
    drawWatermark(ctx, width, height);
  }
}
