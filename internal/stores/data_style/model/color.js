import { DEFAULT_MODEL_COMPONENT_TYPE_COLORS } from "@ogw_front/utils/default_styles";
import { dispatchToComponentTypes } from "./visibility";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

function getAttributeFunctionName(type, attrType, action) {
  let componentTypePlural = "Blocks";
  if (type === "Corner") {
    componentTypePlural = "Corners";
  } else if (type === "Line") {
    componentTypePlural = "Lines";
  } else if (type === "Surface") {
    componentTypePlural = "Surfaces";
  }
  const attributeTypeCapitalized = attrType.charAt(0).toUpperCase() + attrType.slice(1);

  if (action === "get_name") {
    return `model${componentTypePlural}${attributeTypeCapitalized}AttributeName`;
  }
  if (action === "set_name") {
    return `setModel${componentTypePlural}${attributeTypeCapitalized}AttributeName`;
  }
  if (action === "get_range") {
    return `model${componentTypePlural}${attributeTypeCapitalized}AttributeRange`;
  }
  if (action === "set_range") {
    return `setModel${componentTypePlural}${attributeTypeCapitalized}AttributeRange`;
  }
  if (action === "get_colormap") {
    return `model${componentTypePlural}${attributeTypeCapitalized}AttributeColorMap`;
  }
  if (action === "set_colormap") {
    return `setModel${componentTypePlural}${attributeTypeCapitalized}AttributeColorMap`;
  }
}

function useModelColorStyle(componentStyleFunctions) {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  function getComponentAttributeStore(type) {
    return componentStyleFunctions[type];
  }

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
    const store = getComponentAttributeStore(type);
    const getNameFn = getAttributeFunctionName(type, mode, "get_name");
    const setNameFn = getAttributeFunctionName(type, mode, "set_name");
    const getRangeFn = getAttributeFunctionName(type, mode, "get_range");
    const setRangeFn = getAttributeFunctionName(type, mode, "set_range");
    const getColormapFn = getAttributeFunctionName(type, mode, "get_colormap");
    const setColormapFn = getAttributeFunctionName(type, mode, "set_colormap");

    const name = store[getNameFn](modelId, idsForType[0]);
    if (name) {
      await store[setNameFn](modelId, idsForType, name);
      const [minimum, maximum] = store[getRangeFn](modelId, idsForType[0]);
      if (minimum !== undefined && maximum !== undefined) {
        await store[setRangeFn](modelId, idsForType, minimum, maximum);
      }
      const colorMap = store[getColormapFn](modelId, idsForType[0]);
      if (colorMap) {
        await store[setColormapFn](modelId, idsForType, colorMap);
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
    const store = getComponentAttributeStore(type);
    const getNameFn = getAttributeFunctionName(type, mode, "get_name");
    const setNameFn = getAttributeFunctionName(type, mode, "set_name");
    const getRangeFn = getAttributeFunctionName(type, mode, "get_range");
    const setRangeFn = getAttributeFunctionName(type, mode, "set_range");
    const getColormapFn = getAttributeFunctionName(type, mode, "get_colormap");
    const setColormapFn = getAttributeFunctionName(type, mode, "set_colormap");

    const name = store[getNameFn](modelId, componentId);
    if (name) {
      await store[setNameFn](modelId, [componentId], name);
      const [minimum, maximum] = store[getRangeFn](modelId, componentId);
      if (minimum !== undefined && maximum !== undefined) {
        await store[setRangeFn](modelId, [componentId], minimum, maximum);
      }
      const colorMap = store[getColormapFn](modelId, componentId);
      if (colorMap) {
        await store[setColormapFn](modelId, [componentId], colorMap);
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
  };
}

export { useModelColorStyle };
