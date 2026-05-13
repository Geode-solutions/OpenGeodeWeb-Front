import scientificPresets from "@ogw_front/assets/scientific_colormaps.json";

function getRGBPointsFromPreset(presetName) {
  return (
    scientificPresets
      .flatMap((category) => category.Children)
      .find((preset) => preset.Name === presetName)?.RGBPoints ?? []
  );
}

export { getRGBPointsFromPreset, scientificPresets };
