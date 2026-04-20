import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps";

function getRGBPointsFromPreset(presetName) {
  if (!presetName) {
    return [];
  }
  const preset = vtkColorMaps.getPresetByName(presetName);
  if (!preset) {
    return [];
  }
  return preset.RGBPoints;
}

export { getRGBPointsFromPreset };
