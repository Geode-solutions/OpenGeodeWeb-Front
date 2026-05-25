import { useDataStore } from "@ogw_front/stores/data";
import { useModelCornersColor } from "./color";
import { useModelCornersCommonStyle } from "./common";
import { useModelCornersVisibility } from "./visibility";
import { useModelAttributeStyle } from "../attribute";

async function setModelCornersDefaultStyle(_id) {
  // Placeholder
}

export function useModelCornersStyle() {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelCornersCommonStyle();
  const modelVisibilityStyle = useModelCornersVisibility();
  const modelColorStyle = useModelCornersColor();
  const modelAttributeStyle = useModelAttributeStyle();

  async function applyModelCornersStyle(modelId) {
    const corners_ids = await dataStore.getCornersGeodeIds(modelId);
    if (!corners_ids?.length) {
      return;
    }

    const visibilityGroups = {};
    const colorGroups = {};
    const attributeGroups = {};

    for (const corner_id of corners_ids) {
      const style = modelCommonStyle.modelCornerStyle(modelId, corner_id);

      const visibility = String(style.visibility);
      if (!visibilityGroups[visibility]) {
        visibilityGroups[visibility] = [];
      }
      visibilityGroups[visibility].push(corner_id);

      const color_mode = style.color_mode || "constant";
      if (color_mode === "constant" || color_mode === "random") {
        const color_key = color_mode === "random" ? "random" : JSON.stringify(style.color);
        if (!colorGroups[color_key]) {
          colorGroups[color_key] = { color_mode, color: style.color, corners_ids: [] };
        }
        colorGroups[color_key].corners_ids.push(corner_id);
      } else {
        const attrKey = `${color_mode}_attribute`;
        const attrStyle = style[attrKey] || {};
        const name = attrStyle.name;
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
              corners_ids: [],
            };
          }
          attributeGroups[attr_key].corners_ids.push(corner_id);
        }
      }
    }

    const promises = [
      ...Object.entries(visibilityGroups).map(([visibility, ids]) =>
        modelVisibilityStyle.setModelCornersVisibility(modelId, ids, visibility === "true"),
      ),
      ...Object.values(colorGroups).map(({ color_mode, color, corners_ids: ids }) =>
        modelColorStyle.setModelCornersColor(modelId, ids, color, color_mode),
      ),
      ...Object.values(attributeGroups).flatMap(({ color_mode, name, minimum, maximum, colorMap, corners_ids: ids }) => {
        const list = [
          modelAttributeStyle.setModelComponentsAttributeName(modelId, ids, color_mode, "Corner", name)
        ];
        if (minimum !== undefined && maximum !== undefined) {
          list.push(
            modelAttributeStyle.setModelComponentsAttributeRange(modelId, ids, color_mode, "Corner", minimum, maximum)
          );
        }
        if (colorMap) {
          list.push(
            modelAttributeStyle.setModelComponentsAttributeColorMap(modelId, ids, color_mode, "Corner", colorMap)
          );
        }
        return list;
      }),
    ];

    return Promise.all(promises);
  }

  return {
    applyModelCornersStyle,
    setModelCornersDefaultStyle,
    ...modelCommonStyle,
    ...modelVisibilityStyle,
    ...modelColorStyle,
  };
}
