import type { BlockId, ModelId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { isAttributeValid } from "@ogw_internal/stores/data_style/attribute_valid";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksCommonStyle } from "./common";
import { useModelBlocksPolyhedronAttribute } from "./polyhedron";
import { useModelBlocksVertexAttribute } from "./vertex";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

const schema = viewer_schemas.opengeodeweb_viewer.model.blocks.color;

export function useModelBlocksColor(): {
  modelBlockColoring: (modelId: ModelId, block_id?: BlockId) => StyleValues;
  modelBlockColor: (modelId: ModelId, block_id?: BlockId) => RGBAColor | undefined;
  setModelBlocksColor: (
    modelId: ModelId,
    blocks_ids: BlockId[],
    color: RGBAColor | undefined,
    activeColoring?: string,
    collectionId?: string,
  ) => Promise<unknown>;
  modelBlockActiveColoring: (modelId: ModelId, block_id?: BlockId) => unknown;
  setModelBlocksActiveColoring: (
    modelId: ModelId,
    blocks_ids: BlockId[],
    activeColoring: string,
    collectionId?: string,
  ) => Promise<void>;
} {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelCommonStyle();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const modelBlocksVertexAttribute = useModelBlocksVertexAttribute();
  const modelBlocksPolyhedronAttribute = useModelBlocksPolyhedronAttribute();

  function modelBlockColoring(modelId: ModelId, block_id?: BlockId): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return modelBlocksCommonStyle.modelBlockStyle(modelId, block_id).coloring as StyleValues;
  }

  function modelBlockColor(modelId: ModelId, block_id?: BlockId): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return modelBlockColoring(modelId, block_id).constant as RGBAColor | undefined;
  }

  async function setModelBlocksColor(
    modelId: ModelId,
    blocks_ids: BlockId[],
    color: RGBAColor | undefined,
    activeColoring = "constant",
    collectionId?: string,
  ): Promise<unknown> {
    const result = await modelCommonStyle.setModelTypeColor(
      modelId,
      blocks_ids,
      color,
      schema,
      activeColoring,
      collectionId,
    );
    return result;
  }

  function modelBlockActiveColoring(modelId: ModelId, block_id?: BlockId): unknown {
    return modelBlockColoring(modelId, block_id).active;
  }

  async function applyVertexColoring(modelId: ModelId, blocks_ids: BlockId[]): Promise<void> {
    const name = modelBlocksVertexAttribute.modelBlocksVertexAttributeName(modelId, blocks_ids[0]);
    const item = modelBlocksVertexAttribute.modelBlocksVertexAttributeItem(modelId, blocks_ids[0]);
    const [minimum, maximum] = modelBlocksVertexAttribute.modelBlocksVertexAttributeRange(
      modelId,
      blocks_ids[0],
    );
    const colorMap = modelBlocksVertexAttribute.modelBlocksVertexAttributeColorMap(
      modelId,
      blocks_ids[0],
    );
    const no_data_color = modelBlocksVertexAttribute.modelBlocksVertexAttributeNoDataColor(
      modelId,
      blocks_ids[0],
    );
    const attribute = { name, item, minimum, maximum, colorMap, no_data_color };
    if (isAttributeValid(attribute)) {
      await modelBlocksVertexAttribute.setModelBlocksVertexAttribute(
        modelId,
        blocks_ids,
        attribute,
      );
    }
  }

  async function applyPolyhedronColoring(modelId: ModelId, blocks_ids: BlockId[]): Promise<void> {
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
    const no_data_color = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeNoDataColor(
      modelId,
      blocks_ids[0],
    );
    const attribute = { name, item, minimum, maximum, colorMap, no_data_color };
    if (isAttributeValid(attribute)) {
      await modelBlocksPolyhedronAttribute.setModelBlocksPolyhedronAttribute(
        modelId,
        blocks_ids,
        attribute,
      );
    }
  }

  async function setModelBlocksActiveColoring(
    modelId: ModelId,
    blocks_ids: BlockId[],
    activeColoring: string,
    collectionId?: string,
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
      await setModelBlocksColor(modelId, blocks_ids, color, activeColoring, collectionId);
      return;
    }

    if (activeColoring === "vertex") {
      await applyVertexColoring(modelId, blocks_ids);
    } else if (activeColoring === "polyhedron") {
      await applyPolyhedronColoring(modelId, blocks_ids);
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
