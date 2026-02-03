import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps"

export function getRGBPointsFromPreset(presetName) {
  const preset = vtkColorMaps.getPresetByName(presetName)
  return preset ? preset.RGBPoints : []
}
