import { useDataStore } from "@ogw_front/stores/data";
import { useModelSurfacesColor } from "./color";
import { useModelSurfacesCommonStyle } from "./common";
import { useModelSurfacesPolygonAttribute } from "./polygon";
import { useModelSurfacesVertexAttribute } from "./vertex";
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

  async function applyModelSurfacesStyle(modelId) {
    const surfaces_ids = await dataStore.getSurfacesGeodeIds(modelId);
    if (!surfaces_ids?.length) {
      return;
    }

    const visibilityGroups = {};
    const colorGroups = {};
    const attributeGroups = {};

    for (const surfaces_id of surfaces_ids) {
      const style = modelCommonStyle.modelSurfaceStyle(modelId, surfaces_id);

      const visibility = String(style.visibility);
      if (!visibilityGroups[visibility]) {
        visibilityGroups[visibility] = [];
      }
      visibilityGroups[visibility].push(surfaces_id);

      const coloring = modelColorStyle.modelSurfaceColoring(modelId, surfaces_id);
      const activeColoring = coloring.active;
      if (activeColoring === "constant") {
        const color = coloring.constant;
        const color_key = JSON.stringify(color);
        if (!colorGroups[color_key]) {
          colorGroups[color_key] = { activeColoring, color, surfaces_ids: [] };
        }
        colorGroups[color_key].surfaces_ids.push(surfaces_id);
      } else if (activeColoring === "random") {
        if (!colorGroups["random"]) {
          colorGroups["random"] = { activeColoring, color: undefined, surfaces_ids: [] };
        }
        colorGroups["random"].surfaces_ids.push(surfaces_id);
      } else {
        const attributeStyle = coloring[activeColoring];
        const { name } = attributeStyle;
        const { minimum, maximum, colorMap } = attributeStyle.storedConfigs[name];
        const attributeGroupKey = `${activeColoring}_${name}_${colorMap}_${minimum}_${maximum}`;
        if (!attributeGroups[attributeGroupKey]) {
          attributeGroups[attributeGroupKey] = {
            activeColoring,
            name,
            minimum,
            maximum,
            colorMap,
            surfaces_ids: [],
          };
        }
        attributeGroups[attributeGroupKey].surfaces_ids.push(surfaces_id);
      }
    }

    const promises = [
      ...Object.entries(visibilityGroups).map(([visibility, ids]) =>
        modelVisibilityStyle.setModelSurfacesVisibility(modelId, ids, visibility === "true"),
      ),
      ...Object.values(colorGroups).map(({ activeColoring, color, surfaces_ids: ids }) =>
        modelColorStyle.setModelSurfacesColor(modelId, ids, color, activeColoring),
      ),
      ...Object.values(attributeGroups).flatMap(
        ({ activeColoring, name, minimum, maximum, colorMap, surfaces_ids: ids }) => {
          const isVertex = activeColoring === "vertex";
          const attributeStyle = isVertex
            ? modelSurfacesVertexAttribute
            : modelSurfacesPolygonAttribute;
          const setAttributeName = isVertex
            ? attributeStyle.setModelSurfacesVertexAttributeName
            : attributeStyle.setModelSurfacesPolygonAttributeName;
          const setAttributeRange = isVertex
            ? attributeStyle.setModelSurfacesVertexAttributeRange
            : attributeStyle.setModelSurfacesPolygonAttributeRange;
          const setAttributeColorMap = isVertex
            ? attributeStyle.setModelSurfacesVertexAttributeColorMap
            : attributeStyle.setModelSurfacesPolygonAttributeColorMap;

          const list = [setAttributeName(modelId, ids, name)];
          if (minimum !== undefined && maximum !== undefined) {
            list.push(setAttributeRange(modelId, ids, minimum, maximum));
          }
          if (colorMap) {
            list.push(setAttributeColorMap(modelId, ids, colorMap));
          }
          return list;
        },
      ),
    ];

    return Promise.all(promises);
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
