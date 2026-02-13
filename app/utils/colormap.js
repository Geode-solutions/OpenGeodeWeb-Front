import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps"

export function getRGBPointsFromPreset(presetName) {
  return vtkColorMaps.getPresetByName(presetName).RGBPoints
}
