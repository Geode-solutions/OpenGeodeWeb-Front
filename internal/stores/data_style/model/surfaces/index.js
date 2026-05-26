import { useDataStore } from "@ogw_front/stores/data";
import { useModelSurfacesColor } from "./color";
import { useModelSurfacesCommonStyle } from "./common";
import { useModelSurfacesPolygonAttributeStyle } from "./polygon";
import { useModelSurfacesVertexAttributeStyle } from "./vertex";
import { useModelSurfacesVisibility } from "./visibility";

async function setModelSurfacesDefaultStyle(_id) {
  // Placeholder
}

export function useModelSurfacesStyle() {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelSurfacesCommonStyle();
  const modelVisibilityStyle = useModelSurfacesVisibility();
  const modelColorStyle = useModelSurfacesColor();
  const modelSurfacesVertexAttributeStyle = useModelSurfacesVertexAttributeStyle();
  const modelSurfacesPolygonAttributeStyle = useModelSurfacesPolygonAttributeStyle();

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

      const color_mode = style.color_mode || "constant";
      if (color_mode === "constant" || color_mode === "random") {
        const color_key = color_mode === "random" ? "random" : JSON.stringify(style.color);
        if (!colorGroups[color_key]) {
          colorGroups[color_key] = { color_mode, color: style.color, surfaces_ids: [] };
        }
        colorGroups[color_key].surfaces_ids.push(surfaces_id);
      } else {
        const attrKey = `${color_mode}_attribute`;
        const attrStyle = style[attrKey] || {};
        const { name } = attrStyle;
        if (name) {
          const storedConfig = (attrStyle.storedConfigs && attrStyle.storedConfigs[name]) || {};
          const { minimum, maximum, colorMap } = storedConfig;
          const attr_key = `${color_mode}_${name}_${colorMap}_${minimum}_${maximum}`;
          if (!attributeGroups[attr_key]) {
            attributeGroups[attr_key] = {
              color_mode,
              name,
              minimum,
              maximum,
              colorMap,
              surfaces_ids: [],
            };
          }
          attributeGroups[attr_key].surfaces_ids.push(surfaces_id);
        }
      }
    }

    const promises = [
      ...Object.entries(visibilityGroups).map(([visibility, ids]) =>
        modelVisibilityStyle.setModelSurfacesVisibility(modelId, ids, visibility === "true"),
      ),
      ...Object.values(colorGroups).map(({ color_mode, color, surfaces_ids: ids }) =>
        modelColorStyle.setModelSurfacesColor(modelId, ids, color, color_mode),
      ),
      ...Object.values(attributeGroups).flatMap(
        ({ color_mode, name, minimum, maximum, colorMap, surfaces_ids: ids }) => {
          const isVertex = color_mode === "vertex";
          const attributeStyle = isVertex
            ? modelSurfacesVertexAttributeStyle
            : modelSurfacesPolygonAttributeStyle;
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
    ...modelSurfacesVertexAttributeStyle,
    ...modelSurfacesPolygonAttributeStyle,
  };
}
