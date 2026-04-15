/**
 * Web-Mercator projection confined to the bounding box of Germany.
 *
 * This is intentionally not a general-purpose projection — it exists solely to
 * map `(lng, lat)` to canvas coordinates for renders of the Germany map.
 */

export const GERMANY_BOUNDS = {
  minLng: 5.4,
  maxLng: 15.6,
  minLat: 47.15,
  maxLat: 55.15,
} as const;

const PADDING_X = 50;
const PADDING_TOP = 40;
const PADDING_BOTTOM = 60;

function latToMercY(lat: number): number {
  const rad = (lat * Math.PI) / 180;
  return Math.log(Math.tan(Math.PI / 4 + rad / 2));
}

const MERC_Y_MIN = latToMercY(GERMANY_BOUNDS.minLat);
const MERC_Y_MAX = latToMercY(GERMANY_BOUNDS.maxLat);

export function geoToCanvas(
  lng: number,
  lat: number,
  width: number,
  height: number,
): [x: number, y: number] {
  const drawW = width - PADDING_X * 2;
  const drawH = height - PADDING_TOP - PADDING_BOTTOM;

  const x =
    PADDING_X +
    ((lng - GERMANY_BOUNDS.minLng) / (GERMANY_BOUNDS.maxLng - GERMANY_BOUNDS.minLng)) * drawW;
  const mercY = latToMercY(lat);
  const y = PADDING_TOP + (1 - (mercY - MERC_Y_MIN) / (MERC_Y_MAX - MERC_Y_MIN)) * drawH;
  return [x, y];
}
