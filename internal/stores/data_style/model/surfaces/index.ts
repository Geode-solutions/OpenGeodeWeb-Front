import { isModelSurfacesPolygonAttributeValid, useModelSurfacesPolygonAttribute } from "./polygon";
import { isModelSurfacesVertexAttributeValid, useModelSurfacesVertexAttribute } from "./vertex";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelSurfacesColor } from "./color";
import { useModelSurfacesCommonStyle } from "./common";
import { useModelSurfacesVisibility } from "./visibility";

async function setModelSurfacesDefaultStyle(_id) {
  // Placeholder
}
export function useModelSurfacesStyle() {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelSurfacesCommonStyle();
  const modelVisibilityStyle = useModelSurfacesVisibility();
  const modelColorStyle = useModelSurfacesColor();
  const modelSurfacesVertexAttribute = useModelSurfacesVertexAttribute();
  const modelSurfacesPolygonAttribute = useModelSurfacesPolygonAttribute();

  function applyModelSurfacesVisibilityStyle(modelId, surfaces_ids) {
    const visibilityGroups = {};
    for (const surfaces_id of surfaces_ids) {
      const style = modelCommonStyle.modelSurfaceStyle(modelId, surfaces_id);
      const visibility = String(style.visibility);
      if (!visibilityGroups[visibility]) {
        visibilityGroups[visibility] = [];
      }
      visibilityGroups[visibility].push(surfaces_id);
    }
    return Promise.all(
      Object.entries(visibilityGroups).map(([visibility, ids]) =>
        modelVisibilityStyle.setModelSurfacesVisibility(modelId, ids, visibility === "true"),
      ),
    );
  }

  function applyModelSurfacesColoringStyle(modelId, surfaces_ids) {
    const activeColoringGroups = {};
    for (const surfaces_id of surfaces_ids) {
      const activeColoring = modelColorStyle.modelSurfaceActiveColoring(modelId, surfaces_id);
      if (!activeColoringGroups[activeColoring]) {
        activeColoringGroups[activeColoring] = [];
      }
      activeColoringGroups[activeColoring].push(surfaces_id);
    }

    const coloringPromises = [];

    for (const [type, type_surfaces_ids] of Object.entries(activeColoringGroups)) {
      if (type === "constant") {
        const colorGroups = {};
        for (const surfaces_id of type_surfaces_ids) {
          const color = modelColorStyle.modelSurfaceColor(modelId, surfaces_id);
          const color_key = JSON.stringify(color);
          if (!colorGroups[color_key]) {
            colorGroups[color_key] = { color, surfaces_ids: [] };
          }
          colorGroups[color_key].surfaces_ids.push(surfaces_id);
        }
        coloringPromises.push(
          ...Object.values(colorGroups).map(({ color, surfaces_ids: ids }) =>
            modelColorStyle.setModelSurfacesColor(modelId, ids, color, "constant"),
          ),
        );
      } else if (type === "random") {
        coloringPromises.push(
          modelColorStyle.setModelSurfacesColor(modelId, type_surfaces_ids, undefined, "random"),
        );
      } else if (type === "vertex") {
        const vertexGroups = {};
        for (const surfaces_id of type_surfaces_ids) {
          const name = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeName(
            modelId,
            surfaces_id,
          );
          const item = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeItem(
            modelId,
            surfaces_id,
          );
          const [minimum, maximum] = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeRange(
            modelId,
            surfaces_id,
          );
          const colorMap = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeColorMap(
            modelId,
            surfaces_id,
          );
          const attribute = { name, item, minimum, maximum, colorMap };
          if (!isModelSurfacesVertexAttributeValid(attribute)) {
            continue;
          }
          const key = `${name}_${item}_${colorMap}_${minimum}_${maximum}`;
          if (!vertexGroups[key]) {
            vertexGroups[key] = {
              name,
              item,
              minimum,
              maximum,
              colorMap,
              surfaces_ids: [],
            };
          }
          vertexGroups[key].surfaces_ids.push(surfaces_id);
        }
        coloringPromises.push(
          ...Object.values(vertexGroups).map(
            ({ name, item, minimum, maximum, colorMap, surfaces_ids: ids }) =>
              modelSurfacesVertexAttribute.setModelSurfacesVertexAttribute(modelId, ids, {
                name,
                item,
                minimum,
                maximum,
                colorMap,
              }),
          ),
        );
      } else if (type === "polygon") {
        const polygonGroups = {};
        for (const surfaces_id of type_surfaces_ids) {
          const name = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeName(
            modelId,
            surfaces_id,
          );
          const item = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeItem(
            modelId,
            surfaces_id,
          );
          const [minimum, maximum] =
            modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeRange(modelId, surfaces_id);
          const colorMap = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeColorMap(
            modelId,
            surfaces_id,
          );
          const attribute = { name, item, minimum, maximum, colorMap };
          if (!isModelSurfacesPolygonAttributeValid(attribute)) {
            continue;
          }
          const key = `${name}_${item}_${colorMap}_${minimum}_${maximum}`;
          if (!polygonGroups[key]) {
            polygonGroups[key] = {
              name,
              item,
              minimum,
              maximum,
              colorMap,
              surfaces_ids: [],
            };
          }
          polygonGroups[key].surfaces_ids.push(surfaces_id);
        }
        coloringPromises.push(
          ...Object.values(polygonGroups).map(
            ({ name, item, minimum, maximum, colorMap, surfaces_ids: ids }) =>
              modelSurfacesPolygonAttribute.setModelSurfacesPolygonAttribute(modelId, ids, {
                name,
                item,
                minimum,
                maximum,
                colorMap,
              }),
          ),
        );
      }
    }
    return Promise.all(coloringPromises);
  }

  async function applyModelSurfacesStyle(modelId) {
    const surfaces_ids = await dataStore.getSurfacesGeodeIds(modelId);
    if (surfaces_ids.length === 0) {
      return;
    }
    return Promise.all([
      applyModelSurfacesVisibilityStyle(modelId, surfaces_ids),
      applyModelSurfacesColoringStyle(modelId, surfaces_ids),
    ]);
  }

  return {
    applyModelSurfacesStyle,
    setModelSurfacesDefaultStyle,
    ...modelCommonStyle,
    ...modelVisibilityStyle,
    ...modelColorStyle,
    ...modelSurfacesVertexAttribute,
    ...modelSurfacesPolygonAttribute,
  };
}
