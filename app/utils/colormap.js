import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps"

function getRGBPointsFromPreset(presetName) {
  return vtkColorMaps.getPresetByName(presetName).RGBPoints
}

export { getRGBPointsFromPreset }