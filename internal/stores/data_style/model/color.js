import { DEFAULT_MODEL_COMPONENT_TYPE_COLORS } from "@ogw_front/utils/default_styles";
import { dispatchToComponentTypes } from "./visibility";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelAttributeStyle } from "./attribute";

function useModelColorStyle(componentStyleFunctions) {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();
  const modelAttributeStyle = useModelAttributeStyle();

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
    const mode = dataStyleState.getComponentStyle(modelId, componentId).color_mode || "constant";
    return mode === "constant" ? "color" : mode;
  }

  function getModelComponentTypeColor(modelId, type) {
    return (
      dataStyleState.getModelComponentTypeStyle(modelId, type).color ||
      DEFAULT_MODEL_COMPONENT_TYPE_COLORS[type]
    );
  }

  function getModelComponentTypeColorMode(modelId, type) {
    const mode = dataStyleState.getModelComponentTypeStyle(modelId, type).color_mode || "constant";
    return mode === "constant" ? "color" : mode;
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
    const mode = color_mode === "color" ? "constant" : color_mode;
    await modelCommonStyle.mutateModelComponentTypeStyle(modelId, type, { color_mode: mode });
    const idsForType = await dataStore.getMeshComponentGeodeIds(modelId, type);
    if (idsForType.length === 0) {
      return;
    }

    if (mode === "random" || mode === "constant") {
      await setModelComponentsColor(modelId, idsForType, undefined, mode);
      return;
    }

    await modelCommonStyle.mutateComponentStyles(modelId, idsForType, { color_mode: mode });
    const name = modelAttributeStyle.modelComponentAttributeName(modelId, idsForType[0], mode);
    if (name) {
      await modelAttributeStyle.setModelComponentsAttributeName(
        modelId,
        idsForType,
        mode,
        type,
        name,
      );
      const [minimum, maximum] = modelAttributeStyle.modelComponentAttributeRange(
        modelId,
        idsForType[0],
        mode,
      );
      if (minimum !== undefined && maximum !== undefined) {
        await modelAttributeStyle.setModelComponentsAttributeRange(
          modelId,
          idsForType,
          mode,
          type,
          minimum,
          maximum,
        );
      }
      const colorMap = modelAttributeStyle.modelComponentAttributeColorMap(
        modelId,
        idsForType[0],
        mode,
      );
      if (colorMap) {
        await modelAttributeStyle.setModelComponentsAttributeColorMap(
          modelId,
          idsForType,
          mode,
          type,
          colorMap,
        );
      }
    }
  }

  async function setModelComponentColorMode(modelId, componentId, color_mode) {
    const mode = color_mode === "color" ? "constant" : color_mode;
    await modelCommonStyle.mutateComponentStyle(modelId, componentId, { color_mode: mode });
    if (mode === "random" || mode === "constant") {
      await setModelComponentsColor(modelId, [componentId], undefined, mode);
      return;
    }

    const type = await dataStore.meshComponentType(modelId, componentId);
    const name = modelAttributeStyle.modelComponentAttributeName(modelId, componentId, mode);
    if (name) {
      await modelAttributeStyle.setModelComponentsAttributeName(
        modelId,
        [componentId],
        mode,
        type,
        name,
      );
      const [minimum, maximum] = modelAttributeStyle.modelComponentAttributeRange(
        modelId,
        componentId,
        mode,
      );
      if (minimum !== undefined && maximum !== undefined) {
        await modelAttributeStyle.setModelComponentsAttributeRange(
          modelId,
          [componentId],
          mode,
          type,
          minimum,
          maximum,
        );
      }
      const colorMap = modelAttributeStyle.modelComponentAttributeColorMap(
        modelId,
        componentId,
        mode,
      );
      if (colorMap) {
        await modelAttributeStyle.setModelComponentsAttributeColorMap(
          modelId,
          [componentId],
          mode,
          type,
          colorMap,
        );
      }
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
    ...modelAttributeStyle,
  };
}

export { useModelColorStyle };
