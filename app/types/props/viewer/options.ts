import type { AttributeColorMap, ColoringType } from "@ogw_front/types/attribute";
import type { Texture } from "@ogw_front/types/texture";

// Whether a coloring type is offered for a data, and whether it is colored through a color map
interface ColoringCapability {
  available?: boolean;
  hasColorMap?: boolean;
}

// The coloring capabilities of a data, by coloring type
type ColoringCapabilities = Record<ColoringType, ColoringCapability>;

// A field of a texture a texture item changed, with its new value
interface TextureFieldUpdate {
  key: keyof Texture;
  value: Texture[keyof Texture];
}

// A color map preset, or a group of presets with its children
interface ColorMapPreset {
  readonly Name: AttributeColorMap;
  readonly Children?: readonly ColorMapPreset[];
}

export type { ColorMapPreset, ColoringCapabilities, ColoringCapability, TextureFieldUpdate };
