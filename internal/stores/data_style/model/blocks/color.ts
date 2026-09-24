import {
  isModelBlocksPolyhedronAttributeValid,
  useModelBlocksPolyhedronAttribute,
} from "./polyhedron";
import { isModelBlocksVertexAttributeValid, useModelBlocksVertexAttribute } from "./vertex";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksCommonStyle } from "./common";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.blocks.color;

export function useModelBlocksColor(): {
  modelBlockColoring: (id: string, block_id?: string) => StyleValues;
  modelBlockColor: (id: string, block_id?: string) => unknown;
  setModelBlocksColor: (
    modelId: string,
    blocks_ids: string[],
    color: unknown,
    activeColoring?: string,
    colorId?: string,
  ) => Promise<unknown>;
  modelBlockActiveColoring: (id: string, block_id?: string) => unknown;
  setModelBlocksActiveColoring: (
    modelId: string,
    blocks_ids: string[],
    activeColoring: string,
    colorId?: string,
  ) => Promise<void>;
} {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelCommonStyle();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const modelBlocksVertexAttribute = useModelBlocksVertexAttribute();
  const modelBlocksPolyhedronAttribute = useModelBlocksPolyhedronAttribute();

  function modelBlockColoring(id: string, block_id?: string): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return modelBlocksCommonStyle.modelBlockStyle(id, block_id).coloring as StyleValues;
  }

  function modelBlockColor(id: string, block_id?: string): unknown {
    return modelBlockColoring(id, block_id).constant;
  }

  async function setModelBlocksColor(
    modelId: string,
    blocks_ids: string[],
    color: unknown,
    activeColoring = "constant",
    colorId?: string,
  ): Promise<unknown> {
    const result = await modelCommonStyle.setModelTypeColor(
      modelId,
      blocks_ids,
      color,
      schema,
      activeColoring,
      colorId,
    );
    return result;
  }

  function modelBlockActiveColoring(id: string, block_id?: string): unknown {
    return modelBlockColoring(id, block_id).active;
  }

  async function setModelBlocksActiveColoring(
    modelId: string,
    blocks_ids: string[],
    activeColoring: string,
    colorId?: string,
  ): Promise<void> {
    const totalBlockIds = await dataStore.getBlocksGeodeIds(modelId);
    if (blocks_ids.length === totalBlockIds.length) {
      await modelBlocksCommonStyle.mutateModelBlocksTypeColoring(modelId, {
        active: activeColoring,
      });
    }
    await modelCommonStyle.mutateComponentStyles(modelId, blocks_ids, {
      coloring: { active: activeColoring },
    });
    if (activeColoring === "constant" || activeColoring === "random") {
      const color = modelBlockColor(modelId, blocks_ids[0]);
      await setModelBlocksColor(modelId, blocks_ids, color, activeColoring, colorId);
      return;
    }

    if (activeColoring === "vertex") {
      const name = modelBlocksVertexAttribute.modelBlocksVertexAttributeName(
        modelId,
        blocks_ids[0],
      );
      const item = modelBlocksVertexAttribute.modelBlocksVertexAttributeItem(
        modelId,
        blocks_ids[0],
      );
      const [minimum, maximum] = modelBlocksVertexAttribute.modelBlocksVertexAttributeRange(
        modelId,
        blocks_ids[0],
      );
      const colorMap = modelBlocksVertexAttribute.modelBlocksVertexAttributeColorMap(
        modelId,
        blocks_ids[0],
      );
      const attribute = { name, item, minimum, maximum, colorMap };
      if (isModelBlocksVertexAttributeValid(attribute)) {
        await modelBlocksVertexAttribute.setModelBlocksVertexAttribute(
          modelId,
          blocks_ids,
          attribute,
        );
      }
    } else if (activeColoring === "polyhedron") {
      const name = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeName(
        modelId,
        blocks_ids[0],
      );
      const item = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeItem(
        modelId,
        blocks_ids[0],
      );
      const [minimum, maximum] = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeRange(
        modelId,
        blocks_ids[0],
      );
      const colorMap = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeColorMap(
        modelId,
        blocks_ids[0],
      );
      const attribute = { name, item, minimum, maximum, colorMap };
      if (isModelBlocksPolyhedronAttributeValid(attribute)) {
        await modelBlocksPolyhedronAttribute.setModelBlocksPolyhedronAttribute(
          modelId,
          blocks_ids,
          attribute,
        );
      }
    }
  }

  return {
    setModelBlocksColor,
    modelBlockColoring,
    modelBlockColor,
    modelBlockActiveColoring,
    setModelBlocksActiveColoring,
  };
}
