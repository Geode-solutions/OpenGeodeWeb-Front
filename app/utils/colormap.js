import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps"

export function getRGBPointsFromPreset(presetName) {
  return vtkColorMaps.getPresetByName(presetName)
}

export function convertRGBPointsToSchemaFormat(flatRGBPoints) {
  if (!flatRGBPoints || !Array.isArray(flatRGBPoints)) {
    return []
  }
  const points = []
  for (let i = 0; i < flatRGBPoints.length; i += 4) {
    points.push([
      flatRGBPoints[i],
      flatRGBPoints[i + 1] * 255,
      flatRGBPoints[i + 2] * 255,
      flatRGBPoints[i + 3] * 255,
    ])
  }
  return points
}
