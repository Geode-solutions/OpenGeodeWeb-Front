import colormaps from "@ogw_front/assets/colormaps.json";

function getRGBPointsFromPreset(presetName) {
  return (
    colormaps.flatMap((category) => category.Children).find((preset) => preset.Name === presetName)
      ?.RGBPoints ?? []
  );
}

export { getRGBPointsFromPreset, colormaps };
