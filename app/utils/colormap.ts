// oxlint-disable unicorn/prefer-export-from
import colormaps from "@ogw_front/assets/colormaps.json";

import { newInstance as vtkColorTransferFunction } from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction";

type ColormapPreset = (typeof colormaps)[number]["Children"][number];

function getPresetByName(presetName: string): ColormapPreset | undefined {
  return colormaps
    .flatMap((category) => category.Children)
    .find((preset) => preset.Name === presetName);
}

function getRGBPointsFromPreset(presetName: string): number[] {
  return getPresetByName(presetName)?.RGBPoints ?? [];
}

function getPresetsWithCurrentAtTop(presetName: string) {
  const currentPreset = getPresetByName(presetName);
  return [currentPreset, ...colormaps].filter(Boolean);
}

function drawCanvasForPreset(
  presetName: string,
  canvas: HTMLCanvasElement | undefined | null,
): void {
  if (!canvas) {
    return;
  }
  const rgbPoints = getRGBPointsFromPreset(presetName);
  if (!rgbPoints || rgbPoints.length === 0) {
    return;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }
  const { height, width } = canvas;
  const lut = vtkColorTransferFunction();

  const LAST_POINT_OFFSET = 4;
  const THREE = 3;

  for (let pointIdx = 0; pointIdx < rgbPoints.length; pointIdx += 4) {
    lut.addRGBPoint(
      rgbPoints[pointIdx] ?? 0,
      rgbPoints[pointIdx + 1] ?? 0,
      rgbPoints[pointIdx + 2] ?? 0,
      rgbPoints[pointIdx + THREE] ?? 0,
    );
  }
  const table = lut.getUint8Table(
    rgbPoints[0] ?? 0,
    rgbPoints.at(-LAST_POINT_OFFSET) ?? 0,
    width,
    true,
  );
  const imageData = ctx.createImageData(width, height);
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
  ctx.putImageData(imageData, 0, 0);
}

export { drawCanvasForPreset, getRGBPointsFromPreset, getPresetByName, getPresetsWithCurrentAtTop };

export { default as colormaps } from "@ogw_front/assets/colormaps.json";
