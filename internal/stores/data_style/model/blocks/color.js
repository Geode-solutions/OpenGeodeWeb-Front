import { useModelBlocksCommonStyle } from "./common";
import { useModelBlocksPolyhedronAttribute } from "./polyhedron";
import { useModelBlocksVertexAttribute } from "./vertex";
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
    await modelCommonStyle.mutateComponentStyles(modelId, blocks_ids, {
      coloring: { active: activeColoring },
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
      await modelBlocksVertexAttribute.setModelBlocksVertexAttributeName(modelId, blocks_ids, name);
      const [min, max] = modelBlocksVertexAttribute.modelBlocksVertexAttributeRange(
        modelId,
        blocks_ids[0],
      );
      await modelBlocksVertexAttribute.setModelBlocksVertexAttributeRange(
        modelId,
        blocks_ids,
        min,
        max,
      );
      const colorMap = modelBlocksVertexAttribute.modelBlocksVertexAttributeColorMap(
        modelId,
        blocks_ids[0],
      );
      await modelBlocksVertexAttribute.setModelBlocksVertexAttributeColorMap(
        modelId,
        blocks_ids,
        colorMap,
      );
    } else if (activeColoring === "polyhedron") {
      const name = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeName(
        modelId,
        blocks_ids[0],
      );
      await modelBlocksPolyhedronAttribute.setModelBlocksPolyhedronAttributeName(
        modelId,
        blocks_ids,
        name,
      );
      const [min, max] = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeRange(
        modelId,
        blocks_ids[0],
      );
      await modelBlocksPolyhedronAttribute.setModelBlocksPolyhedronAttributeRange(
        modelId,
        blocks_ids,
        min,
        max,
      );
      const colorMap = modelBlocksPolyhedronAttribute.modelBlocksPolyhedronAttributeColorMap(
        modelId,
        blocks_ids[0],
      );
      await modelBlocksPolyhedronAttribute.setModelBlocksPolyhedronAttributeColorMap(
        modelId,
        blocks_ids,
        colorMap,
      );
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
