// Colors of the orientation cube of the camera orientation panel (CameraOrientation.vue), from the
// Vuetify theme it is shown in: faces a bit off the surface, labels and edges in the surface ink,
// The hovered face inverted. The cube is drawn by vtk.js on canvases, so it takes CSS color strings.

const HEX_BASE = 16;
const CHANNEL_LENGTH = 2;
const HEX_COLOR = /^#?(?<hex>[\da-f]{6})/iu;
// Part of the ink in the face color: the faces stand out of the panel without competing with labels
const FACE_INK_RATIO = 0.15;
const EDGE_OPACITY = 0.4;
const HOVERED_FACE_OPACITY = 0.95;
type Rgb = [number, number, number];

// The cube of the dark theme, when the theme has no usable surface colors
const DARK_SURFACE_CHANNEL = 33;
const MAX_CHANNEL = 255;
const FALLBACK_SURFACE: Rgb = [DARK_SURFACE_CHANNEL, DARK_SURFACE_CHANNEL, DARK_SURFACE_CHANNEL];
const FALLBACK_INK: Rgb = [MAX_CHANNEL, MAX_CHANNEL, MAX_CHANNEL];

interface CubeStyle {
  faceColor: string;
  fontColor: string;
  edgeColor: string;
  hoveredFaceColor: string;
  hoveredFontColor: string;
}

function hexChannel(hex: string, index: number): number {
  return Number.parseInt(hex.slice(index * CHANNEL_LENGTH, (index + 1) * CHANNEL_LENGTH), HEX_BASE);
}

// Vuetify resolves its theme colors to #RRGGBB strings
function parseHex(color: unknown): Rgb | undefined {
  const hex = typeof color === "string" ? HEX_COLOR.exec(color)?.groups?.hex : undefined;
  if (hex === undefined) {
    return undefined;
  }
  return [hexChannel(hex, 0), hexChannel(hex, 1), hexChannel(hex, 2)];
}

function rgba([red, green, blue]: Rgb, alpha = 1): string {
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function mix(base: Rgb, ink: Rgb, ratio: number): Rgb {
  function channel(index: 0 | 1 | 2): number {
    return Math.round(base[index] * (1 - ratio) + ink[index] * ratio);
  }
  return [channel(0), channel(1), channel(2)];
}

// Cube colors for the theme colors (Vuetify `theme.themes[name].colors`)
function orientationCubeStyle(colors: Record<"surface" | "on-surface", unknown>): CubeStyle {
  const surface = parseHex(colors.surface) ?? FALLBACK_SURFACE;
  const ink = parseHex(colors["on-surface"]) ?? FALLBACK_INK;
  return {
    faceColor: rgba(mix(surface, ink, FACE_INK_RATIO)),
    fontColor: rgba(ink),
    edgeColor: rgba(ink, EDGE_OPACITY),
    hoveredFaceColor: rgba(ink, HOVERED_FACE_OPACITY),
    hoveredFontColor: rgba(surface),
  };
}

export { orientationCubeStyle };
export type { CubeStyle };
