import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { dispatchToComponentTypes } from "./visibility";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleState } from "@ogw_internal/stores/data_style/state";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";

// The four per-component-type style composables (Surface/Line/Block/Corner) each expose a different, large set of methods (color, visibility, per-attribute-kind getters/setters...). This module only cares about looking a handful of them up dynamically by name (built into ATTRIBUTE_FUNCTIONS below), so a precise structural type for componentStyleFunctions isn't worth modelling here; `any` keeps the dynamic dispatch table honest about that.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentStyleFunctions = Record<"Surface" | "Line" | "Block" | "Corner", any>;

interface AttributeAccessors {
  getName: (modelId: string, componentId: string) => string | undefined;
  setName: (modelId: string, componentIds: string[], name: string) => unknown;
  getRange: (modelId: string, componentId: string) => [number | undefined, number | undefined];
  setRange: (modelId: string, componentIds: string[], minimum: number, maximum: number) => unknown;
  getColorMap: (modelId: string, componentId: string) => string | undefined;
  setColorMap: (modelId: string, componentIds: string[], colorMap: string) => unknown;
}

// oxlint-disable-next-line max-lines-per-function
function useModelColorStyle(componentStyleFunctions: ComponentStyleFunctions) {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();
  const { Surface, Line, Block, Corner } = componentStyleFunctions;
  const ATTRIBUTE_FUNCTIONS: Record<string, Record<string, AttributeAccessors>> = {
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
  function getModelComponentColor(modelId: string, componentId: string): unknown {
    return (dataStyleState.getComponentStyle(modelId, componentId).coloring as StyleValues | undefined)
      ?.constant;
  }
  function modelComponentTypeColor(modelId: string, type: string): unknown {
    return (
      (dataStyleState.getModelComponentTypeStyle(modelId, type).coloring as StyleValues | undefined)
        ?.constant ||
      (
        (dataStyleState.getStyle(modelId)[`${type.toLowerCase()}s`] as StyleValues).coloring as StyleValues
      ).constant
    );
  }
  function getModelComponentEffectiveColor(modelId: string, componentId: string, type: string): unknown {
    const individualColor = getModelComponentColor(modelId, componentId);
    if (individualColor !== undefined) {
      return individualColor;
    }
    return modelComponentTypeColor(modelId, type);
  }
  function getModelComponentActiveColoring(modelId: string, componentId: string): unknown {
    return (dataStyleState.getComponentStyle(modelId, componentId).coloring as StyleValues | undefined)
      ?.active;
  }
  function getModelComponentTypeActiveColoring(modelId: string, type: string): unknown {
    return (
      (dataStyleState.getModelComponentTypeStyle(modelId, type).coloring as StyleValues | undefined)
        ?.active ||
      ((dataStyleState.getStyle(modelId)[`${type.toLowerCase()}s`] as StyleValues).coloring as StyleValues)
        .active
    );
  }
  async function setModelComponentsColor(
    modelId: string,
    componentIds: string[],
    color: unknown,
    activeColoring = "constant",
  ) {
    await modelCommonStyle.mutateComponentStyles(modelId, componentIds, {
      coloring: {
        constant: color,
        active: activeColoring,
      },
    });
    return await dispatchToComponentTypes(
      modelId,
      componentIds,
      "Color",
      {
        componentStyleFunctions,
      },
      color,
      activeColoring,
    );
  }
  async function setModelComponentTypeColor(modelId: string, type: string, color: unknown) {
    await modelCommonStyle.mutateModelComponentTypeStyle(modelId, type, {
      coloring: {
        constant: color,
        active: "constant",
      },
    });
    const idsForType = await dataStore.getMeshComponentGeodeIds(modelId, type);
    if (idsForType.length === 0) {
      return;
    }
    await setModelComponentsColor(modelId, idsForType, color);
  }
  async function setModelComponentTypeActiveColoring(
    modelId: string,
    type: string,
    activeColoring: string,
  ) {
    await modelCommonStyle.mutateModelComponentTypeStyle(modelId, type, {
      coloring: {
        active: activeColoring,
      },
    });
    const idsForType = await dataStore.getMeshComponentGeodeIds(modelId, type);
    if (idsForType.length === 0) {
      return;
    }
    if (activeColoring === "random" || activeColoring === "constant") {
      await setModelComponentsColor(modelId, idsForType, undefined, activeColoring);
      return;
    }
    await modelCommonStyle.mutateComponentStyles(modelId, idsForType, {
      coloring: {
        active: activeColoring,
      },
    });
    const { getName, setName, getRange, setRange, getColorMap, setColorMap } =
      ATTRIBUTE_FUNCTIONS[type]![activeColoring]!;
    const name = getName(modelId, idsForType[0]!);
    if (name) {
      await setName(modelId, idsForType, name);
      const [minimum, maximum] = getRange(modelId, idsForType[0]!);
      if (minimum !== undefined && maximum !== undefined) {
        await setRange(modelId, idsForType, minimum, maximum);
      }
      const colorMap = getColorMap(modelId, idsForType[0]!);
      if (colorMap) {
        await setColorMap(modelId, idsForType, colorMap);
      }
    }
  }
  async function setModelComponentActiveColoring(
    modelId: string,
    componentId: string,
    activeColoring: string,
  ) {
    await modelCommonStyle.mutateComponentStyle(modelId, componentId, {
      coloring: {
        active: activeColoring,
      },
    });
    if (activeColoring === "random" || activeColoring === "constant") {
      await setModelComponentsColor(modelId, [componentId], undefined, activeColoring);
      return;
    }
    const type = await dataStore.meshComponentType(modelId, componentId);
    if (type === undefined) {
      return;
    }
    const { getName, setName, getRange, setRange, getColorMap, setColorMap } =
      ATTRIBUTE_FUNCTIONS[type]![activeColoring]!;
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
  function getModelColor(modelId: string): unknown {
    return (dataStyleState.getStyle(modelId).coloring as StyleValues).constant;
  }
  function getModelActiveColoring(modelId: string): unknown {
    return (dataStyleState.getStyle(modelId).coloring as StyleValues).active;
  }
  return {
    getModelColor,
    getModelActiveColoring,
    getModelComponentColor,
    getModelComponentEffectiveColor,
    getModelComponentActiveColoring,
    modelComponentTypeColor,
    getModelComponentTypeActiveColoring,
    setModelComponentTypeColor,
    setModelComponentTypeActiveColoring,
    setModelComponentActiveColoring,
    setModelComponentsColor,
  };
}
export { useModelColorStyle };
