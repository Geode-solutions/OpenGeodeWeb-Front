import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps"

export function getRGBPointsFromPreset(presetName, min, max) {
  const preset = vtkColorMaps.getPresetByName(presetName)
  if (!preset || !preset.RGBPoints) {
    return [
      [min, 59, 76, 192],
      [(min + max) / 2, 221, 221, 221],
      [max, 180, 4, 38],
    ]
  }
  return getRGBPointsFromPresetData(preset.RGBPoints, min, max)
}

function getRGBPointsFromPresetData(rgbPoints, min, max) {
  const points = []
  const presetMin = rgbPoints[0]
  const presetMax = rgbPoints[rgbPoints.length - 4]
  const presetRange = presetMax - presetMin
  const targetRange = max - min

  for (let i = 0; i < rgbPoints.length; i += 4) {
    const originalValue = rgbPoints[i]
    const normalizedValue = presetRange !== 0
      ? (originalValue - presetMin) / presetRange
      : 0
    const scaledValue = min + normalizedValue * targetRange
    points.push([
      scaledValue,
      Math.round(rgbPoints[i + 1] * 255),
      Math.round(rgbPoints[i + 2] * 255),
      Math.round(rgbPoints[i + 3] * 255),
    ])
  }
  return points
}
