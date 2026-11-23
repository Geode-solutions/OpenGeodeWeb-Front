// Strata fills of the orientation globe (Viewer/OrientationGlobe.vue): the sphere is cut by horizontal
// Planes of the world into alternate light and clear layers, like the slices of the Geode Solutions mark.
// Rasterized per pixel with supersampling for smooth edges. Pure math: no vtk.js nor Vue here.
import type { ViewBasis } from "@ogw_front/utils/orientation_gizmo";

interface Strata {
  // World height range of the stratum on the unit sphere
  bottom: number;
  top: number;
  // Fill opacity, 0 for the strata left clear
  opacity: number;
}

interface StrataSample {
  coverage: number;
  shade: number;
}

// Same heights as the latitude rings of the globe (orientation_globe.ts)
const STRATA_LINE_HEIGHT = 0.62;
const LIGHT_OPACITY = 0.62;
const SHADOW_OPACITY = 0.38;
const STRATA: readonly Strata[] = [
  { bottom: STRATA_LINE_HEIGHT, top: 1, opacity: LIGHT_OPACITY },
  { bottom: 0, top: STRATA_LINE_HEIGHT, opacity: 0 },
  { bottom: -STRATA_LINE_HEIGHT, top: 0, opacity: SHADOW_OPACITY },
  { bottom: -1, top: -STRATA_LINE_HEIGHT, opacity: 0 },
];
const SUPERSAMPLING = 3;
const SAMPLE_CENTER = 0.5;
const SHADE_BASE = 0.85;
const SHADE_RANGE = 0.15;
const BYTES_PER_PIXEL = 4;
const MAX_CHANNEL = 255;
const RGB_CHANNELS = 3;
const HEX_BASE = 16;
const HEX_CHANNEL_LENGTH = 2;

// World height of the visible sphere point under the given screen offset, as a ratio of the radius
// (x right, y down). Undefined outside the sphere.
function visibleHeight(basis: ViewBasis, x: number, y: number): number | undefined {
  const squared = x * x + y * y;
  if (squared > 1) {
    return undefined;
  }
  const towardsViewer = Math.sqrt(1 - squared);
  return x * basis.right[2] - y * basis.upward[2] + towardsViewer * basis.toViewer[2];
}

// Fill opacity of the stratum at this world height
function strataOpacity(height: number): number {
  return STRATA.find(({ bottom, top }) => height >= bottom && height <= top)?.opacity ?? 0;
}

// "#RRGGBB" to its red, green and blue channels
function hexChannels(color: string): number[] {
  return Array.from({ length: RGB_CHANNELS }, (_item, channel) => {
    const start = 1 + channel * HEX_CHANNEL_LENGTH;
    return Number.parseInt(color.slice(start, start + HEX_CHANNEL_LENGTH), HEX_BASE);
  });
}

// Coverage and lighting of one sample of the globe (x, y in radius units, y down)
function strataSample(basis: ViewBasis, x: number, y: number): StrataSample {
  const height = visibleHeight(basis, x, y);
  if (height === undefined) {
    return { coverage: 0, shade: 0 };
  }
  const coverage = strataOpacity(height);
  const towardsViewer = Math.sqrt(Math.max(0, 1 - x * x - y * y));
  return { coverage, shade: coverage * (SHADE_BASE + SHADE_RANGE * towardsViewer) };
}

// Supersampled coverage and lighting of one canvas pixel
function strataPixel(
  basis: ViewBasis,
  column: number,
  row: number,
  pixelsPerRadius: number,
): StrataSample {
  const total: StrataSample = { coverage: 0, shade: 0 };
  for (let index = 0; index < SUPERSAMPLING * SUPERSAMPLING; index += 1) {
    const sampleColumn = index % SUPERSAMPLING;
    const sampleRow = Math.floor(index / SUPERSAMPLING);
    const x = (column + (sampleColumn + SAMPLE_CENTER) / SUPERSAMPLING) / pixelsPerRadius - 1;
    const y = (row + (sampleRow + SAMPLE_CENTER) / SUPERSAMPLING) / pixelsPerRadius - 1;
    const sample = strataSample(basis, x, y);
    total.coverage += sample.coverage;
    total.shade += sample.shade;
  }
  return total;
}

// RGBA pixels of the strata fills for a square canvas of the given side covering the globe:
// Alternate light and clear layers, like the slices of the brand mark, lit a bit more towards the viewer
function strataPixels(basis: ViewBasis, side: number, color: string): Uint8ClampedArray {
  const channels = hexChannels(color);
  const pixels = new Uint8ClampedArray(side * side * BYTES_PER_PIXEL);
  const pixelsPerRadius = side / 2;
  const samples = SUPERSAMPLING * SUPERSAMPLING;
  for (let index = 0; index < side * side; index += 1) {
    const { coverage, shade } = strataPixel(
      basis,
      index % side,
      Math.floor(index / side),
      pixelsPerRadius,
    );
    if (coverage > 0) {
      const offset = index * BYTES_PER_PIXEL;
      for (let channel = 0; channel < RGB_CHANNELS; channel += 1) {
        pixels[offset + channel] = (channels[channel] ?? 0) * (shade / coverage);
      }
      pixels[offset + RGB_CHANNELS] = (MAX_CHANNEL * coverage) / samples;
    }
  }
  return pixels;
}

export { strataOpacity, strataPixels, visibleHeight };
