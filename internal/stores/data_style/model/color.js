import { DEFAULT_MODEL_COMPONENT_TYPE_COLORS } from "@ogw_front/utils/default_styles";
import { dispatchToComponentTypes } from "./visibility";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

function useModelColorStyle(componentStyleFunctions) {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();

  const { Surface, Line, Block, Corner } = componentStyleFunctions;

  const ATTRIBUTE_FUNCTIONS = {
    Surface: {
      vertex: {
        getName: Surface.modelSurfacesVertexAttributeName,
        setName: Surface.setModelSurfacesVertexAttributeName,
        getRange: Surface.modelSurfacesVertexAttributeRange,
        setRange: Surface.setModelSurfacesVertexAttributeRange,
        getColorMap: Surface.modelSurfacesVertexAttributeColorMap,
        setColorMap: Surface.setModelSurfacesVertexAttributeColorMap,
      },
      polygon: {
        getName: Surface.modelSurfacesPolygonAttributeName,
        setName: Surface.setModelSurfacesPolygonAttributeName,
        getRange: Surface.modelSurfacesPolygonAttributeRange,
        setRange: Surface.setModelSurfacesPolygonAttributeRange,
        getColorMap: Surface.modelSurfacesPolygonAttributeColorMap,
        setColorMap: Surface.setModelSurfacesPolygonAttributeColorMap,
      },
    },
    Line: {
      vertex: {
        getName: Line.modelLinesVertexAttributeName,
        setName: Line.setModelLinesVertexAttributeName,
        getRange: Line.modelLinesVertexAttributeRange,
        setRange: Line.setModelLinesVertexAttributeRange,
        getColorMap: Line.modelLinesVertexAttributeColorMap,
        setColorMap: Line.setModelLinesVertexAttributeColorMap,
      },
      edge: {
        getName: Line.modelLinesEdgeAttributeName,
        setName: Line.setModelLinesEdgeAttributeName,
        getRange: Line.modelLinesEdgeAttributeRange,
        setRange: Line.setModelLinesEdgeAttributeRange,
        getColorMap: Line.modelLinesEdgeAttributeColorMap,
        setColorMap: Line.setModelLinesEdgeAttributeColorMap,
      },
    },
    Block: {
      vertex: {
        getName: Block.modelBlocksVertexAttributeName,
        setName: Block.setModelBlocksVertexAttributeName,
        getRange: Block.modelBlocksVertexAttributeRange,
        setRange: Block.setModelBlocksVertexAttributeRange,
        getColorMap: Block.modelBlocksVertexAttributeColorMap,
        setColorMap: Block.setModelBlocksVertexAttributeColorMap,
      },
      polyhedron: {
        getName: Block.modelBlocksPolyhedronAttributeName,
        setName: Block.setModelBlocksPolyhedronAttributeName,
        getRange: Block.modelBlocksPolyhedronAttributeRange,
        setRange: Block.setModelBlocksPolyhedronAttributeRange,
        getColorMap: Block.modelBlocksPolyhedronAttributeColorMap,
        setColorMap: Block.setModelBlocksPolyhedronAttributeColorMap,
      },
    },
    Corner: {
      vertex: {
        getName: Corner.modelCornersVertexAttributeName,
        setName: Corner.setModelCornersVertexAttributeName,
        getRange: Corner.modelCornersVertexAttributeRange,
        setRange: Corner.setModelCornersVertexAttributeRange,
        getColorMap: Corner.modelCornersVertexAttributeColorMap,
        setColorMap: Corner.setModelCornersVertexAttributeColorMap,
      },
    },
  };

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
    const { getName, setName, getRange, setRange, getColorMap, setColorMap } =
      ATTRIBUTE_FUNCTIONS[type][mode];

    const name = getName(modelId, idsForType[0]);
    if (name) {
      await setName(modelId, idsForType, name);
      const [minimum, maximum] = getRange(modelId, idsForType[0]);
      if (minimum !== undefined && maximum !== undefined) {
        await setRange(modelId, idsForType, minimum, maximum);
      }
      const colorMap = getColorMap(modelId, idsForType[0]);
      if (colorMap) {
        await setColorMap(modelId, idsForType, colorMap);
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
    const { getName, setName, getRange, setRange, getColorMap, setColorMap } =
      ATTRIBUTE_FUNCTIONS[type][mode];

    const name = getName(modelId, componentId);
    if (name) {
      await setName(modelId, [componentId], name);
      const [minimum, maximum] = getRange(modelId, componentId);
      if (minimum !== undefined && maximum !== undefined) {
        await setRange(modelId, [componentId], minimum, maximum);
      }
      const colorMap = getColorMap(modelId, componentId);
      if (colorMap) {
        await setColorMap(modelId, [componentId], colorMap);
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
