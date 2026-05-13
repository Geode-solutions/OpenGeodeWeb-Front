import scientificPresets from "@ogw_front/assets/scientific_colormaps.json";
import vtkColorMaps from "@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps";

function getRGBPointsFromPreset(presetName) {
  for (const category of scientificPresets) {
    const scientificPreset = category.Children.find((preset) => preset.Name === presetName);
    if (scientificPreset) {
      return scientificPreset.RGBPoints;
    }
  }
  return vtkColorMaps.getPresetByName(presetName)?.RGBPoints ?? [];
}

export { getRGBPointsFromPreset, scientificPresets };
