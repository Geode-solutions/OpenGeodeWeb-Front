import { DEFAULT_MODEL_COMPONENT_TYPE_COLORS } from "./constants";
import { dispatchToComponentTypes } from "./visibility";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useViewerStore } from "@ogw_front/stores/viewer";

function useModelColorStyle(stores) {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const viewerStore = useViewerStore();
  const modelCommonStyle = useModelCommonStyle();

  function getModelComponentColor(modelId, componentId) {
    return dataStyleState.getComponentStyle(modelId, componentId).color;
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
    viewerStore.start_request();
    try {
      await modelCommonStyle.mutateModelComponentTypeStyle(modelId, type, {
        color,
        color_mode: "constant",
      });
      const idsForType = await dataStore.getMeshComponentGeodeIds(modelId, type);
      if (idsForType.length === 0) {
        return;
      }
      await setModelComponentsColor(modelId, idsForType, color);
    } finally {
      viewerStore.stop_request();
    }
  }

  async function setModelComponentTypeColorMode(modelId, type, color_mode) {
    viewerStore.start_request();
    try {
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
    } finally {
      viewerStore.stop_request();
    }
  }

  async function setModelComponentColorMode(modelId, componentId, color_mode) {
    viewerStore.start_request();
    try {
      await modelCommonStyle.mutateComponentStyle(modelId, componentId, { color_mode });
      if (color_mode === "random") {
        await setModelComponentsColor(modelId, [componentId], undefined, color_mode);
      }
    } finally {
      viewerStore.stop_request();
    }
  }

  async function setModelComponentsColor(modelId, componentIds, color, color_mode = "constant") {
    viewerStore.start_request();
    try {
      await modelCommonStyle.mutateComponentStyles(modelId, componentIds, { color, color_mode });
      return await dispatchToComponentTypes(
        modelId,
        componentIds,
        "Color",
        { dataStore, stores, viewerStore },
        color,
        color_mode,
      );
    } finally {
      viewerStore.stop_request();
    }
  }

  return {
    getModelComponentColor,
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
