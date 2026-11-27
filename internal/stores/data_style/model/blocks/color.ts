import type { BlockId, ModelId } from "@ogw_front/types/identifiers";
import type { ColorRGBA } from "@geode/opengeodeweb-viewer/schema_types";
import type { ColoringType } from "@ogw_front/types/attribute";
import type { GeodeId } from "@geode/opengeodeweb-microservice/schema_types";
import type { NonEmptyArray } from "@ogw_front/utils/arrays";
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
  modelBlockColor: (modelId: ModelId, block_id?: BlockId) => ColorRGBA | undefined;
  setModelBlocksColor: (
    modelId: ModelId,
    blockIds: BlockId[],
    color: ColorRGBA | undefined,
    activeColoring?: ColoringType,
    collectionId?: GeodeId,
  ) => Promise<unknown>;
  modelBlockActiveColoring: (modelId: ModelId, block_id?: BlockId) => unknown;
  setModelBlocksActiveColoring: (
    modelId: ModelId,
    blockIds: NonEmptyArray<BlockId>,
    activeColoring: ColoringType,
    collectionId?: GeodeId,
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

  function modelBlockColor(modelId: ModelId, block_id?: BlockId): ColorRGBA | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return modelBlockColoring(modelId, block_id).constant as ColorRGBA | undefined;
  }

  async function setModelBlocksColor(
    modelId: ModelId,
    blockIds: BlockId[],
    color: ColorRGBA | undefined,
    activeColoring = "constant",
    collectionId?: GeodeId,
  ): Promise<unknown> {
    const result = await modelCommonStyle.setModelTypeColor(
      modelId,
      blockIds,
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

  async function applyVertexColoring(
    modelId: ModelId,
    blockIds: NonEmptyArray<BlockId>,
  ): Promise<void> {
    const name = modelBlocksVertexAttribute.modelBlocksVertexAttributeName(modelId, blockIds[0]);
    const item = modelBlocksVertexAttribute.modelBlocksVertexAttributeItem(modelId, blockIds[0]);
    const [minimum, maximum] = modelBlocksVertexAttribute.modelBlocksVertexAttributeRange(
      modelId,
      blockIds[0],
    );
    const colorMap = modelBlocksVertexAttribute.modelBlocksVertexAttributeColorMap(
      modelId,
      blockIds[0],
    );
    const no_data_color = modelBlocksVertexAttribute.modelBlocksVertexAttributeNoDataColor(
      modelId,
      blockIds[0],
    );
    const attribute = { name, item, minimum, maximum, colorMap, no_data_color };
    if (isAttributeValid(attribute)) {
      await modelBlocksVertexAttribute.setModelBlocksVertexAttribute(modelId, blockIds, attribute);
    }
  }

  async function applyPolyhedronColoring(
    modelId: ModelId,
    blockIds: NonEmptyArray<BlockId>,
  ): Promise<void> {
    const name = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeName(
      modelId,
      blockIds[0],
    );
    const item = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeItem(
      modelId,
      blockIds[0],
    );
    const [minimum, maximum] = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeRange(
      modelId,
      blockIds[0],
    );
    const colorMap = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeColorMap(
      modelId,
      blockIds[0],
    );
    const no_data_color = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeNoDataColor(
      modelId,
      blockIds[0],
    );
    const attribute = { name, item, minimum, maximum, colorMap, no_data_color };
    if (isAttributeValid(attribute)) {
      await modelBlocksPolyhedronAttribute.setModelBlocksPolyhedronAttribute(
        modelId,
        blockIds,
        attribute,
      );
    }
  }

  async function setModelBlocksActiveColoring(
    modelId: ModelId,
    blockIds: NonEmptyArray<BlockId>,
    activeColoring: ColoringType,
    collectionId?: GeodeId,
  ): Promise<void> {
    const totalBlockIds = await dataStore.getBlocksGeodeIds(modelId);
    if (blockIds.length === totalBlockIds.length) {
      await modelBlocksCommonStyle.mutateModelBlocksTypeColoring(modelId, {
        active: activeColoring,
      });
    }
    await modelCommonStyle.mutateComponentStyles(modelId, blockIds, {
      coloring: { active: activeColoring },
    });
    if (activeColoring === "constant" || activeColoring === "random") {
      const color = modelBlockColor(modelId, blockIds[0]);
      await setModelBlocksColor(modelId, blockIds, color, activeColoring, collectionId);
      return;
    }

    if (activeColoring === "vertex") {
      await applyVertexColoring(modelId, blockIds);
    } else if (activeColoring === "polyhedron") {
      await applyPolyhedronColoring(modelId, blockIds);
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
