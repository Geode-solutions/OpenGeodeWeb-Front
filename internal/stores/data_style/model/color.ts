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

// The signatures below describe just the per-attribute-kind methods this module reads off each dynamically-typed composable (see the `any` in ComponentStyleFunctions above). `attributeFn` narrows one such method to its known signature so every downstream read/call is a real, checked type instead of `any`.
type AttributeNameFn = (modelId: string, componentId: string) => string | undefined;
type SetAttributeNameFn = (modelId: string, componentIds: string[], name: string) => unknown;
type AttributeRangeFn = (
  modelId: string,
  componentId: string,
) => [number | undefined, number | undefined];
type SetAttributeRangeFn = (
  modelId: string,
  componentIds: string[],
  minimum: number,
  maximum: number,
) => unknown;
type AttributeColorMapFn = (modelId: string, componentId: string) => string | undefined;
type SetAttributeColorMapFn = (
  modelId: string,
  componentIds: string[],
  colorMap: string,
) => unknown;
type DynamicStyleFunctions = Record<string, unknown>;

function attributeFn<T>(method: unknown): T {
  // oxlint-disable-next-line no-unsafe-type-assertion -- narrowing a dynamically-looked-up method to its known call signature; see comment above.
  return method as T;
}

// oxlint-disable-next-line max-lines-per-function
function useModelColorStyle(componentStyleFunctions: ComponentStyleFunctions): {
  getModelColor: (modelId: string) => unknown;
  getModelActiveColoring: (modelId: string) => unknown;
  getModelComponentColor: (modelId: string, componentId: string) => unknown;
  getModelComponentEffectiveColor: (modelId: string, componentId: string, type: string) => unknown;
  getModelComponentActiveColoring: (modelId: string, componentId: string) => unknown;
  modelComponentTypeColor: (modelId: string, type: string) => unknown;
  getModelComponentTypeActiveColoring: (modelId: string, type: string) => unknown;
  setModelComponentTypeColor: (modelId: string, type: string, color: unknown) => Promise<void>;
  setModelComponentTypeActiveColoring: (
    modelId: string,
    type: string,
    activeColoring: string,
  ) => Promise<void>;
  setModelComponentActiveColoring: (
    modelId: string,
    componentId: string,
    activeColoring: string,
  ) => Promise<void>;
  setModelComponentsColor: (
    modelId: string,
    componentIds: string[],
    color: unknown,
    activeColoring?: string,
  ) => Promise<unknown[]>;
} {
  const dataStore = useDataStore();
  const dataStyleState = useDataStyleState();
  const modelCommonStyle = useModelCommonStyle();
  // oxlint-disable-next-line no-unsafe-type-assertion -- componentStyleFunctions is a dynamic dispatch table typed any by design; see ComponentStyleFunctions comment above.
  const Surface = componentStyleFunctions.Surface as DynamicStyleFunctions;
  // oxlint-disable-next-line no-unsafe-type-assertion -- componentStyleFunctions is a dynamic dispatch table typed any by design; see ComponentStyleFunctions comment above.
  const Line = componentStyleFunctions.Line as DynamicStyleFunctions;
  // oxlint-disable-next-line no-unsafe-type-assertion -- componentStyleFunctions is a dynamic dispatch table typed any by design; see ComponentStyleFunctions comment above.
  const Block = componentStyleFunctions.Block as DynamicStyleFunctions;
  // oxlint-disable-next-line no-unsafe-type-assertion -- componentStyleFunctions is a dynamic dispatch table typed any by design; see ComponentStyleFunctions comment above.
  const Corner = componentStyleFunctions.Corner as DynamicStyleFunctions;
  const ATTRIBUTE_FUNCTIONS: Record<string, Record<string, AttributeAccessors>> = {
    Surface: {
      vertex: {
        getName: attributeFn<AttributeNameFn>(Surface.modelSurfacesVertexAttributeName),
        setName: attributeFn<SetAttributeNameFn>(Surface.setModelSurfacesVertexAttributeName),
        getRange: attributeFn<AttributeRangeFn>(Surface.modelSurfacesVertexAttributeRange),
        setRange: attributeFn<SetAttributeRangeFn>(Surface.setModelSurfacesVertexAttributeRange),
        getColorMap: attributeFn<AttributeColorMapFn>(Surface.modelSurfacesVertexAttributeColorMap),
        setColorMap: attributeFn<SetAttributeColorMapFn>(
          Surface.setModelSurfacesVertexAttributeColorMap,
        ),
      },
      polygon: {
        getName: attributeFn<AttributeNameFn>(Surface.modelSurfacesPolygonAttributeName),
        setName: attributeFn<SetAttributeNameFn>(Surface.setModelSurfacesPolygonAttributeName),
        getRange: attributeFn<AttributeRangeFn>(Surface.modelSurfacesPolygonAttributeRange),
        setRange: attributeFn<SetAttributeRangeFn>(Surface.setModelSurfacesPolygonAttributeRange),
        getColorMap: attributeFn<AttributeColorMapFn>(
          Surface.modelSurfacesPolygonAttributeColorMap,
        ),
        setColorMap: attributeFn<SetAttributeColorMapFn>(
          Surface.setModelSurfacesPolygonAttributeColorMap,
        ),
      },
    },
    Line: {
      vertex: {
        getName: attributeFn<AttributeNameFn>(Line.modelLinesVertexAttributeName),
        setName: attributeFn<SetAttributeNameFn>(Line.setModelLinesVertexAttributeName),
        getRange: attributeFn<AttributeRangeFn>(Line.modelLinesVertexAttributeRange),
        setRange: attributeFn<SetAttributeRangeFn>(Line.setModelLinesVertexAttributeRange),
        getColorMap: attributeFn<AttributeColorMapFn>(Line.modelLinesVertexAttributeColorMap),
        setColorMap: attributeFn<SetAttributeColorMapFn>(Line.setModelLinesVertexAttributeColorMap),
      },
      edge: {
        getName: attributeFn<AttributeNameFn>(Line.modelLinesEdgeAttributeName),
        setName: attributeFn<SetAttributeNameFn>(Line.setModelLinesEdgeAttributeName),
        getRange: attributeFn<AttributeRangeFn>(Line.modelLinesEdgeAttributeRange),
        setRange: attributeFn<SetAttributeRangeFn>(Line.setModelLinesEdgeAttributeRange),
        getColorMap: attributeFn<AttributeColorMapFn>(Line.modelLinesEdgeAttributeColorMap),
        setColorMap: attributeFn<SetAttributeColorMapFn>(Line.setModelLinesEdgeAttributeColorMap),
      },
    },
    Block: {
      vertex: {
        getName: attributeFn<AttributeNameFn>(Block.modelBlocksVertexAttributeName),
        setName: attributeFn<SetAttributeNameFn>(Block.setModelBlocksVertexAttributeName),
        getRange: attributeFn<AttributeRangeFn>(Block.modelBlocksVertexAttributeRange),
        setRange: attributeFn<SetAttributeRangeFn>(Block.setModelBlocksVertexAttributeRange),
        getColorMap: attributeFn<AttributeColorMapFn>(Block.modelBlocksVertexAttributeColorMap),
        setColorMap: attributeFn<SetAttributeColorMapFn>(
          Block.setModelBlocksVertexAttributeColorMap,
        ),
      },
      polyhedron: {
        getName: attributeFn<AttributeNameFn>(Block.modelBlocksPolyhedronAttributeName),
        setName: attributeFn<SetAttributeNameFn>(Block.setModelBlocksPolyhedronAttributeName),
        getRange: attributeFn<AttributeRangeFn>(Block.modelBlocksPolyhedronAttributeRange),
        setRange: attributeFn<SetAttributeRangeFn>(Block.setModelBlocksPolyhedronAttributeRange),
        getColorMap: attributeFn<AttributeColorMapFn>(Block.modelBlocksPolyhedronAttributeColorMap),
        setColorMap: attributeFn<SetAttributeColorMapFn>(
          Block.setModelBlocksPolyhedronAttributeColorMap,
        ),
      },
    },
    Corner: {
      vertex: {
        getName: attributeFn<AttributeNameFn>(Corner.modelCornersVertexAttributeName),
        setName: attributeFn<SetAttributeNameFn>(Corner.setModelCornersVertexAttributeName),
        getRange: attributeFn<AttributeRangeFn>(Corner.modelCornersVertexAttributeRange),
        setRange: attributeFn<SetAttributeRangeFn>(Corner.setModelCornersVertexAttributeRange),
        getColorMap: attributeFn<AttributeColorMapFn>(Corner.modelCornersVertexAttributeColorMap),
        setColorMap: attributeFn<SetAttributeColorMapFn>(
          Corner.setModelCornersVertexAttributeColorMap,
        ),
      },
    },
  };
  function getModelComponentColor(modelId: string, componentId: string): unknown {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    const coloring = dataStyleState.getComponentStyle(modelId, componentId).coloring as StyleValues;
    return coloring.constant;
  }
  function modelComponentTypeColor(modelId: string, type: string): unknown {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    const groupColoring = dataStyleState.getModelComponentTypeStyle(modelId, type)
      .coloring as StyleValues;
    // oxlint-disable-next-line no-unsafe-type-assertion -- style values are stored as loosely-typed StyleValues records; see StyleValues definition.
    const typeStyle = dataStyleState.getStyle(modelId)[`${type.toLowerCase()}s`] as StyleValues;
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    const typeColoring = typeStyle.coloring as StyleValues;
    return groupColoring.constant ?? typeColoring.constant;
  }
  function getModelComponentEffectiveColor(
    modelId: string,
    componentId: string,
    type: string,
  ): unknown {
    const individualColor = getModelComponentColor(modelId, componentId);
    if (individualColor !== undefined) {
      return individualColor;
    }
    return modelComponentTypeColor(modelId, type);
  }
  function getModelComponentActiveColoring(modelId: string, componentId: string): unknown {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    const coloring = dataStyleState.getComponentStyle(modelId, componentId).coloring as StyleValues;
    return coloring.active;
  }
  function getModelComponentTypeActiveColoring(modelId: string, type: string): unknown {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    const groupColoring = dataStyleState.getModelComponentTypeStyle(modelId, type)
      .coloring as StyleValues;
    // oxlint-disable-next-line no-unsafe-type-assertion -- style values are stored as loosely-typed StyleValues records; see StyleValues definition.
    const typeStyle = dataStyleState.getStyle(modelId)[`${type.toLowerCase()}s`] as StyleValues;
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    const typeColoring = typeStyle.coloring as StyleValues;
    return groupColoring.active ?? typeColoring.active;
  }
  async function setModelComponentsColor(
    modelId: string,
    componentIds: string[],
    color: unknown,
    activeColoring = "constant",
  ): Promise<unknown[]> {
    await modelCommonStyle.mutateComponentStyles(modelId, componentIds, {
      coloring: {
        constant: color,
        active: activeColoring,
      },
    });
    return dispatchToComponentTypes(
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
  async function setModelComponentTypeColor(
    modelId: string,
    type: string,
    color: unknown,
  ): Promise<void> {
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
  ): Promise<void> {
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
    const attributeFunctions = ATTRIBUTE_FUNCTIONS[type]?.[activeColoring];
    if (attributeFunctions === undefined) {
      return;
    }
    const { getName, setName, getRange, setRange, getColorMap, setColorMap } = attributeFunctions;
    const firstId = idsForType[0];
    if (firstId === undefined) {
      return;
    }
    const name = getName(modelId, firstId);
    if (name !== undefined && name !== "") {
      await setName(modelId, idsForType, name);
      const [minimum, maximum] = getRange(modelId, firstId);
      if (minimum !== undefined && maximum !== undefined) {
        await setRange(modelId, idsForType, minimum, maximum);
      }
      const colorMap = getColorMap(modelId, firstId);
      if (colorMap !== undefined && colorMap !== "") {
        await setColorMap(modelId, idsForType, colorMap);
      }
    }
  }
  async function setModelComponentActiveColoring(
    modelId: string,
    componentId: string,
    activeColoring: string,
  ): Promise<void> {
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
    const attributeFunctions = ATTRIBUTE_FUNCTIONS[type]?.[activeColoring];
    if (attributeFunctions === undefined) {
      return;
    }
    const { getName, setName, getRange, setRange, getColorMap, setColorMap } = attributeFunctions;
    const name = getName(modelId, componentId);
    if (name !== undefined && name !== "") {
      await setName(modelId, [componentId], name);
      const [minimum, maximum] = getRange(modelId, componentId);
      if (minimum !== undefined && maximum !== undefined) {
        await setRange(modelId, [componentId], minimum, maximum);
      }
      const colorMap = getColorMap(modelId, componentId);
      if (colorMap !== undefined && colorMap !== "") {
        await setColorMap(modelId, [componentId], colorMap);
      }
    }
  }
  function getModelColor(modelId: string): unknown {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return (dataStyleState.getStyle(modelId).coloring as StyleValues).constant;
  }
  function getModelActiveColoring(modelId: string): unknown {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
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
