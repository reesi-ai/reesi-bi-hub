import type { ColorTheme, ThemeName } from './types';

/**
 * Reesi brand theme — orange scale from #FFEFE6 (orange-100) to #572508 (orange-950).
 * Use this by default for all customer-facing heatmaps.
 */
const BRAND: ColorTheme = {
  stops: [
    [0, [255, 255, 255, 0]],
    [0.06, [255, 239, 230, 30]],
    [0.14, [255, 211, 186, 80]],
    [0.25, [250, 179, 139, 140]],
    [0.4, [239, 142, 88, 185]],
    [0.55, [230, 118, 53, 210]],
    [0.7, [198, 93, 33, 230]],
    [0.85, [140, 61, 16, 245]],
    [1, [87, 37, 8, 255]],
  ],
  gradientCss:
    'linear-gradient(90deg, #FFEFE6, #FFD3BA, #FAB38B, #EF8E58, #E67635, #C65D21, #8C3D10, #572508)',
};

const COOL: ColorTheme = {
  stops: [
    [0, [255, 255, 255, 0]],
    [0.06, [230, 245, 255, 30]],
    [0.14, [180, 220, 255, 80]],
    [0.25, [120, 185, 245, 140]],
    [0.4, [60, 140, 220, 185]],
    [0.55, [35, 100, 195, 210]],
    [0.7, [20, 65, 160, 230]],
    [0.85, [12, 40, 120, 245]],
    [1, [5, 15, 80, 255]],
  ],
  gradientCss:
    'linear-gradient(90deg, #e8f4ff, #b4dcff, #78b9f5, #3c8cdc, #2364c3, #1441a0, #0c2878, #050f50)',
};

const PLASMA: ColorTheme = {
  stops: [
    [0, [255, 255, 255, 0]],
    [0.06, [250, 235, 255, 30]],
    [0.14, [220, 180, 250, 80]],
    [0.25, [180, 110, 230, 140]],
    [0.4, [150, 60, 210, 185]],
    [0.55, [130, 35, 185, 210]],
    [0.7, [105, 20, 150, 230]],
    [0.85, [75, 8, 110, 245]],
    [1, [45, 0, 65, 255]],
  ],
  gradientCss:
    'linear-gradient(90deg, #faebff, #dcb4fa, #b46ee6, #963cd2, #8223b9, #691496, #4b086e, #2d0041)',
};

export const THEMES: Record<ThemeName, ColorTheme> = {
  brand: BRAND,
  cool: COOL,
  plasma: PLASMA,
};
