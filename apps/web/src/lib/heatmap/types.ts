import type { HeatmapPoint } from '@reesi/shared';

export type { HeatmapDataset, HeatmapPoint } from '@reesi/shared';

export type ColorStop = [offset: number, rgba: [r: number, g: number, b: number, a: number]];

export interface ColorTheme {
  stops: ColorStop[];
  gradientCss: string;
}

export type ThemeName = 'brand' | 'cool' | 'plasma';

export interface RenderOptions {
  /** Base canvas width in logical pixels. */
  width: number;
  /** Base canvas height in logical pixels. */
  height: number;
  /** Heatmap Gaussian radius. Higher = softer, larger blobs. */
  radius: number;
  /** Global intensity multiplier (> 1 = brighter). */
  intensity: number;
  /** Final alpha multiplier. */
  opacity: number;
  theme: ColorTheme;
  /** Optional Germany polygon mask — if provided, heatmap is clipped to its shape. */
  statesGeoJSON?: GermanyGeoJSON | null;
  /** If true, a small brand watermark is drawn in the lower edge. */
  watermark?: boolean;
}

export interface GeoFeature {
  type: 'Feature';
  geometry:
    | { type: 'Polygon'; coordinates: number[][][] }
    | { type: 'MultiPolygon'; coordinates: number[][][][] };
  properties?: Record<string, unknown>;
}

export interface GermanyGeoJSON {
  type: 'FeatureCollection';
  features: GeoFeature[];
}

export type HeatmapPoints = readonly HeatmapPoint[];
