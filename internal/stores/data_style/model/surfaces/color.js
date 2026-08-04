import { isModelSurfacesPolygonAttributeValid, useModelSurfacesPolygonAttribute } from "./polygon";
import { isModelSurfacesVertexAttributeValid, useModelSurfacesVertexAttribute } from "./vertex";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelSurfacesCommonStyle } from "./common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const schema = viewer_schemas.opengeodeweb_viewer.model.surfaces.color;

export function useModelSurfacesColor() {
  const modelCommonStyle = useModelCommonStyle();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();
  const modelSurfacesVertexAttribute = useModelSurfacesVertexAttribute();
  const modelSurfacesPolygonAttribute = useModelSurfacesPolygonAttribute();

  function modelSurfaceColoring(id, surface_id) {
    return modelSurfacesCommonStyle.modelSurfaceStyle(id, surface_id).coloring;
  }

  function modelSurfaceColor(id, surface_id) {
    return modelSurfaceColoring(id, surface_id).constant;
  }

  function setModelSurfacesColor(modelId, surfaces_ids, color, activeColoring = "constant") {
    return modelCommonStyle.setModelTypeColor(modelId, surfaces_ids, color, schema, activeColoring);
  }

  function modelSurfaceActiveColoring(id, surface_id) {
    return modelSurfaceColoring(id, surface_id).active;
  }

  async function setModelSurfacesActiveColoring(modelId, surfaces_ids, activeColoring) {
    await modelSurfacesCommonStyle.mutateModelSurfacesColoring(modelId, surfaces_ids, {
      active: activeColoring,
    });
    if (activeColoring === "constant" || activeColoring === "random") {
      const color = modelSurfaceColor(modelId, surfaces_ids[0]);
      return setModelSurfacesColor(modelId, surfaces_ids, color, activeColoring);
    }

    if (activeColoring === "vertex") {
      const name = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeName(
        modelId,
        surfaces_ids[0],
      );
      const item = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeItem(
        modelId,
        surfaces_ids[0],
      );
      const [minimum, maximum] = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeRange(
        modelId,
        surfaces_ids[0],
      );
      const colorMap = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeColorMap(
        modelId,
        surfaces_ids[0],
      );
      const attribute = { name, item, minimum, maximum, colorMap };
      if (isModelSurfacesVertexAttributeValid(attribute)) {
        return modelSurfacesVertexAttribute.setModelSurfacesVertexAttribute(
          modelId,
          surfaces_ids,
          attribute,
        );
      }
    } else if (activeColoring === "polygon") {
      const name = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeName(
        modelId,
        surfaces_ids[0],
      );
      const item = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeItem(
        modelId,
        surfaces_ids[0],
      );
      const [minimum, maximum] = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeRange(
        modelId,
        surfaces_ids[0],
      );
      const colorMap = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeColorMap(
        modelId,
        surfaces_ids[0],
      );
      const attribute = { name, item, minimum, maximum, colorMap };
      if (isModelSurfacesPolygonAttributeValid(attribute)) {
        return modelSurfacesPolygonAttribute.setModelSurfacesPolygonAttribute(
          modelId,
          surfaces_ids,
          attribute,
        );
      }
    }
  }

  return {
    setModelSurfacesColor,
    modelSurfaceColoring,
    modelSurfaceColor,
    modelSurfaceActiveColoring,
    setModelSurfacesActiveColoring,
  };
}
