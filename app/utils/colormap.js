import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps"

export function getRGBPointsFromPreset(presetName) {
  return vtkColorMaps.getPresetByName(presetName)
}

export function convertRGBPointsToSchemaFormat(flatRGBPoints, min, max) {
  if (!flatRGBPoints || !Array.isArray(flatRGBPoints)) {
    return []
  }

  const minVal = min !== undefined && min !== null ? Number(min) : 0
  const maxVal = max !== undefined && max !== null ? Number(max) : 1
  const range = maxVal - minVal

  const points = []
  for (let i = 0; i < flatRGBPoints.length; i += 4) {
    let x = flatRGBPoints[i]
    if (min !== undefined && max !== undefined) {
      x = minVal + x * range
    }
    points.push(
      x,
      flatRGBPoints[i + 1],
      flatRGBPoints[i + 2],
      flatRGBPoints[i + 3],
    )
  }
  return points
}
