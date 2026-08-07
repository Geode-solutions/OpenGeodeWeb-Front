import {
  isModelBlocksPolyhedronAttributeValid,
  useModelBlocksPolyhedronAttribute,
} from "./polyhedron";
import { isModelBlocksVertexAttributeValid, useModelBlocksVertexAttribute } from "./vertex";
import { useModelBlocksCommonStyle } from "./common";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.blocks.color;

export function useModelBlocksColor() {
  const modelCommonStyle = useModelCommonStyle();
  const modelBlocksCommonStyle = useModelBlocksCommonStyle();
  const modelBlocksVertexAttribute = useModelBlocksVertexAttribute();
  const modelBlocksPolyhedronAttribute = useModelBlocksPolyhedronAttribute();

  function modelBlockColoring(id, block_id) {
    return modelBlocksCommonStyle.modelBlockStyle(id, block_id).coloring;
  }

  function modelBlockColor(id, block_id) {
    return modelBlockColoring(id, block_id).constant;
  }

  function setModelBlocksColor(modelId, blocks_ids, color, activeColoring = "constant") {
    return modelCommonStyle.setModelTypeColor(modelId, blocks_ids, color, schema, activeColoring);
  }

  function modelBlockActiveColoring(id, block_id) {
    return modelBlockColoring(id, block_id).active;
  }

  async function setModelBlocksActiveColoring(modelId, blocks_ids, activeColoring) {
    await modelBlocksCommonStyle.mutateModelBlocksColoring(modelId, blocks_ids, {
      active: activeColoring,
    });
    if (activeColoring === "constant" || activeColoring === "random") {
      const color = modelBlockColor(modelId, blocks_ids[0]);
      return setModelBlocksColor(modelId, blocks_ids, color, activeColoring);
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
        return modelBlocksVertexAttribute.setModelBlocksVertexAttribute(
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
        return modelBlocksPolyhedronAttribute.setModelBlocksPolyhedronAttribute(
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
