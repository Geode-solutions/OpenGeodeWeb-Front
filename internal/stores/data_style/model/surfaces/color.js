import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelSurfacesCommonStyle } from "./common";
import { useModelSurfacesPolygonAttribute } from "./polygon";
import { useModelSurfacesVertexAttribute } from "./vertex";
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
    await modelCommonStyle.mutateComponentStyles(modelId, surfaces_ids, {
      coloring: { active: activeColoring },
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
      await modelSurfacesVertexAttribute.setModelSurfacesVertexAttributeName(
        modelId,
        surfaces_ids,
        name,
      );
      const [min, max] = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeRange(
        modelId,
        surfaces_ids[0],
      );
      await modelSurfacesVertexAttribute.setModelSurfacesVertexAttributeRange(
        modelId,
        surfaces_ids,
        min,
        max,
      );
      const colorMap = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeColorMap(
        modelId,
        surfaces_ids[0],
      );
      await modelSurfacesVertexAttribute.setModelSurfacesVertexAttributeColorMap(
        modelId,
        surfaces_ids,
        colorMap,
      );
    } else if (activeColoring === "polygon") {
      const name = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeName(
        modelId,
        surfaces_ids[0],
      );
      await modelSurfacesPolygonAttribute.setModelSurfacesPolygonAttributeName(
        modelId,
        surfaces_ids,
        name,
      );
      const [min, max] = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeRange(
        modelId,
        surfaces_ids[0],
      );
      await modelSurfacesPolygonAttribute.setModelSurfacesPolygonAttributeRange(
        modelId,
        surfaces_ids,
        min,
        max,
      );
      const colorMap = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeColorMap(
        modelId,
        surfaces_ids[0],
      );
      await modelSurfacesPolygonAttribute.setModelSurfacesPolygonAttributeColorMap(
        modelId,
        surfaces_ids,
        colorMap,
      );
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
