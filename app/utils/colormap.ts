// oxlint-disable unicorn/prefer-export-from
import colormaps from "@ogw_front/assets/colormaps.json";

import { newInstance as vtkColorTransferFunction } from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction";

interface ColormapPreset {
  readonly Name: string;
  readonly RGBPoints: readonly number[];
}

interface ColormapCategory {
  readonly Name: string;
  readonly Children: readonly ColormapPreset[];
}

const typedColormaps = colormaps as readonly ColormapCategory[];

function getPresetByName(presetName: string): ColormapPreset | undefined {
  return typedColormaps
    .flatMap((category: ColormapCategory) => category.Children)
    .find((preset: ColormapPreset) => preset.Name === presetName);
}

function getRGBPointsFromPreset(presetName: string): readonly number[] {
  return getPresetByName(presetName)?.RGBPoints ?? [];
}

function getPresetsWithCurrentAtTop(
  presetName: string,
): readonly (ColormapPreset | ColormapCategory)[] {
  const currentPreset = getPresetByName(presetName);
  return [currentPreset, ...typedColormaps].filter(
    (preset: ColormapPreset | ColormapCategory | undefined): preset is NonNullable<typeof preset> =>
      Boolean(preset),
  );
}

const LAST_POINT_OFFSET = 4;
const THREE = 3;

function buildColorTable(rgbPoints: readonly number[], width: number): Float32Array {
  const lut = vtkColorTransferFunction();
  for (let pointIdx = 0; pointIdx < rgbPoints.length; pointIdx += 4) {
    lut.addRGBPoint(
      rgbPoints[pointIdx] ?? 0,
      rgbPoints[pointIdx + 1] ?? 0,
      rgbPoints[pointIdx + 2] ?? 0,
      rgbPoints[pointIdx + THREE] ?? 0,
    );
  }
  return lut.getUint8Table(rgbPoints[0] ?? 0, rgbPoints.at(-LAST_POINT_OFFSET) ?? 0, width, true);
}

function fillImageDataFromTable(
  // ImageData can't satisfy prefer-readonly-parameter-types since lib.dom.d.ts types are inherently mutable, so this finding is left unfixed (same pattern as app/plugins/auto_store_register.ts).
  imageData: ImageData,
  // Float32Array's numeric index signature is inherently mutable and can't satisfy prefer-readonly-parameter-types, so this finding is left unfixed (same pattern as app/plugins/auto_store_register.ts).
  table: Readonly<Float32Array>,
  width: number,
  height: number,
): void {
  for (let xCoord = 0; xCoord < width; xCoord += 1) {
    const alpha = table[xCoord * 4 + THREE] ?? 0;
    const blue = table[xCoord * 4 + 2] ?? 0;
    const green = table[xCoord * 4 + 1] ?? 0;
    const red = table[xCoord * 4] ?? 0;
    for (let yCoord = 0; yCoord < height; yCoord += 1) {
      const pixelIdx = (yCoord * width + xCoord) * 4;
      imageData.data[pixelIdx] = red;
      imageData.data[pixelIdx + 1] = green;
      imageData.data[pixelIdx + 2] = blue;
      imageData.data[pixelIdx + THREE] = alpha;
    }
  }
}

function drawCanvasForPreset(
  presetName: string,
  // HTMLCanvasElement can't satisfy prefer-readonly-parameter-types since lib.dom.d.ts types are inherently mutable, so this finding is left unfixed (same pattern as app/plugins/auto_store_register.ts).
  canvas: HTMLCanvasElement | undefined | null,
): void {
  if (!canvas) {
    return;
  }
  const rgbPoints = getRGBPointsFromPreset(presetName);
  if (rgbPoints.length === 0) {
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const { height, width } = canvas;
  const table = buildColorTable(rgbPoints, width);
  const imageData = ctx.createImageData(width, height);
  fillImageDataFromTable(imageData, table, width, height);
  ctx.putImageData(imageData, 0, 0);
}

export { drawCanvasForPreset, getRGBPointsFromPreset, getPresetByName, getPresetsWithCurrentAtTop };

export { default as colormaps } from "@ogw_front/assets/colormaps.json";
