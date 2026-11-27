// Colors of the orientation cube of the camera orientation panel (CameraOrientation.vue), from the
// Vuetify theme it is shown in: faces a bit off the surface, labels and edges in the surface ink,
// The hovered face inverted. The cube is drawn by vtk.js on canvases, so it takes CSS color strings.
import type { ColorRGB } from "@geode/opengeodeweb-viewer/schema_types";

const HEX_BASE = 16;
const CHANNEL_LENGTH = 2;
const HEX_COLOR = /^#?(?<hex>[\da-f]{6})/iu;
// Part of the ink in the face color: the faces stand out of the panel without competing with labels
const FACE_INK_RATIO = 0.15;
const EDGE_OPACITY = 0.4;
const HOVERED_FACE_OPACITY = 0.95;

// The cube of the dark theme, when the theme has no usable surface colors
const DARK_SURFACE_CHANNEL = 33;
const MAX_CHANNEL = 255;
const FALLBACK_SURFACE: ColorRGB = {
  red: DARK_SURFACE_CHANNEL,
  green: DARK_SURFACE_CHANNEL,
  blue: DARK_SURFACE_CHANNEL,
};
const FALLBACK_INK: ColorRGB = { red: MAX_CHANNEL, green: MAX_CHANNEL, blue: MAX_CHANNEL };

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
function parseHex(color: unknown): ColorRGB | undefined {
  const hex = typeof color === "string" ? HEX_COLOR.exec(color)?.groups?.hex : undefined;
  if (hex === undefined) {
    return undefined;
  }
  return { red: hexChannel(hex, 0), green: hexChannel(hex, 1), blue: hexChannel(hex, 2) };
}

function rgba({ red, green, blue }: ColorRGB, alpha = 1): string {
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function mix(base: ColorRGB, ink: ColorRGB, ratio: number): ColorRGB {
  function channel(key: keyof ColorRGB): number {
    return Math.round(base[key] * (1 - ratio) + ink[key] * ratio);
  }
  return { red: channel("red"), green: channel("green"), blue: channel("blue") };
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
