// oxlint-disable unicorn/prefer-export-from
import colormaps from "@ogw_front/assets/colormaps.json";

import { newInstance as vtkColorTransferFunction } from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction";

function getPresetByName(presetName) {
  return colormaps
    .flatMap((category) => category.Children)
    .find((preset) => preset.Name === presetName);
}

function getRGBPointsFromPreset(presetName) {
  return getPresetByName(presetName)?.RGBPoints ?? [];
}

function getPresetsWithCurrentAtTop(presetName) {
  const currentPreset = getPresetByName(presetName);
  return [currentPreset, ...colormaps].filter(Boolean);
}

function drawCanvasForPreset(presetName, canvas) {
  if (!canvas) {
    return;
  }
  const rgbPoints = getRGBPointsFromPreset(presetName);
  if (!rgbPoints || rgbPoints.length === 0) {
    return;
  }
  const ctx = canvas.getContext("2d");
  const { height, width } = canvas;
  const lut = vtkColorTransferFunction();

  const LAST_POINT_OFFSET = 4;
  const THREE = 3;

  for (let pointIdx = 0; pointIdx < rgbPoints.length; pointIdx += 4) {
    lut.addRGBPoint(
      rgbPoints[pointIdx],
      rgbPoints[pointIdx + 1],
      rgbPoints[pointIdx + 2],
      rgbPoints[pointIdx + THREE],
    );
  }
  const table = lut.getUint8Table(rgbPoints[0], rgbPoints.at(-LAST_POINT_OFFSET), width, true);
  const imageData = ctx.createImageData(width, height);
  for (let xCoord = 0; xCoord < width; xCoord += 1) {
    const alpha = table[xCoord * 4 + THREE],
      blue = table[xCoord * 4 + 2],
      green = table[xCoord * 4 + 1],
      red = table[xCoord * 4];
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

export {
  drawCanvasForPreset,
  getRGBPointsFromPreset,
  getPresetByName,
  getPresetsWithCurrentAtTop,
  colormaps,
};
