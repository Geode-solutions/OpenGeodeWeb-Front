import { DEFAULT_MODEL_COMPONENT_TYPE_COLORS } from "@ogw_front/utils/default_styles";
import { dispatchToComponentTypes } from "./visibility";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

function useModelColorStyle(componentStyleFunctions) {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function getModelComponentColor(modelId, componentId) {
    return dataStyleState.getComponentStyle(modelId, componentId).color;
  }

  function getModelComponentEffectiveColor(modelId, componentId, type) {
    const individualColor = getModelComponentColor(modelId, componentId);
    if (individualColor !== undefined) {
      return individualColor;
    }
    return getModelComponentTypeColor(modelId, type);
  }

  function getModelComponentColorMode(modelId, componentId) {
    return dataStyleState.getComponentStyle(modelId, componentId).color_mode || "constant";
  }

  function getModelComponentTypeColor(modelId, type) {
    return (
      dataStyleState.getModelComponentTypeStyle(modelId, type).color ||
      DEFAULT_MODEL_COMPONENT_TYPE_COLORS[type]
    );
  }

  function getModelComponentTypeColorMode(modelId, type) {
    return dataStyleState.getModelComponentTypeStyle(modelId, type).color_mode || "constant";
  }

  async function setModelComponentTypeColor(modelId, type, color) {
    await modelCommonStyle.mutateModelComponentTypeStyle(modelId, type, {
      color,
      color_mode: "constant",
    });
    const idsForType = await dataStore.getMeshComponentGeodeIds(modelId, type);
    if (idsForType.length === 0) {
      return;
    }
    await setModelComponentsColor(modelId, idsForType, color);
  }

  async function setModelComponentTypeColorMode(modelId, type, color_mode) {
    await modelCommonStyle.mutateModelComponentTypeStyle(modelId, type, { color_mode });
    const idsForType = await dataStore.getMeshComponentGeodeIds(modelId, type);
    if (idsForType.length === 0) {
      return;
    }

    if (color_mode === "random") {
      await setModelComponentsColor(modelId, idsForType, undefined, color_mode);
      return;
    }
    await modelCommonStyle.mutateComponentStyles(modelId, idsForType, { color_mode });
  }

  async function setModelComponentColorMode(modelId, componentId, color_mode) {
    await modelCommonStyle.mutateComponentStyle(modelId, componentId, { color_mode });
    if (color_mode === "random") {
      await setModelComponentsColor(modelId, [componentId], undefined, color_mode);
    }
  }

  async function setModelComponentsColor(modelId, componentIds, color, color_mode = "constant") {
    await modelCommonStyle.mutateComponentStyles(modelId, componentIds, { color, color_mode });
    return await dispatchToComponentTypes(
      modelId,
      componentIds,
      "Color",
      { componentStyleFunctions },
      color,
      color_mode,
    );
  }

  return {
    getModelComponentColor,
    getModelComponentEffectiveColor,
    getModelComponentColorMode,
    getModelComponentTypeColor,
    getModelComponentTypeColorMode,
    setModelComponentTypeColor,
    setModelComponentTypeColorMode,
    setModelComponentColorMode,
    setModelComponentsColor,
  };
}

export { useModelColorStyle };
