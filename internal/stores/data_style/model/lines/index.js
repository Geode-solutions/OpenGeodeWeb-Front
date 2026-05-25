import { useDataStore } from "@ogw_front/stores/data";
import { useModelLinesColor } from "./color";
import { useModelLinesCommonStyle } from "./common";
import { useModelLinesVisibility } from "./visibility";
import { useModelAttributeStyle } from "../attribute";

async function setModelLinesDefaultStyle(_id) {
  // Placeholder
}

export function useModelLinesStyle() {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelLinesCommonStyle();
  const modelVisibilityStyle = useModelLinesVisibility();
  const modelColorStyle = useModelLinesColor();
  const modelAttributeStyle = useModelAttributeStyle();

  async function applyModelLinesStyle(modelId) {
    const lines_ids = await dataStore.getLinesGeodeIds(modelId);
    if (!lines_ids?.length) {
      return;
    }

    const visibilityGroups = {};
    const colorGroups = {};
    const attributeGroups = {};

    for (const line_id of lines_ids) {
      const style = modelCommonStyle.modelLineStyle(modelId, line_id);

      const visibility = String(style.visibility);
      if (!visibilityGroups[visibility]) {
        visibilityGroups[visibility] = [];
      }
      visibilityGroups[visibility].push(line_id);

      const color_mode = style.color_mode || "constant";
      if (color_mode === "constant" || color_mode === "random") {
        const color_key = color_mode === "random" ? "random" : JSON.stringify(style.color);
        if (!colorGroups[color_key]) {
          colorGroups[color_key] = { color_mode, color: style.color, lines_ids: [] };
        }
        colorGroups[color_key].lines_ids.push(line_id);
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
              lines_ids: [],
            };
          }
          attributeGroups[attr_key].lines_ids.push(line_id);
        }
      }
    }

    const promises = [
      ...Object.entries(visibilityGroups).map(([visibility, ids]) =>
        modelVisibilityStyle.setModelLinesVisibility(modelId, ids, visibility === "true"),
      ),
      ...Object.values(colorGroups).map(({ color_mode, color, lines_ids: ids }) =>
        modelColorStyle.setModelLinesColor(modelId, ids, color, color_mode),
      ),
      ...Object.values(attributeGroups).flatMap(
        ({ color_mode, name, minimum, maximum, colorMap, lines_ids: ids }) => {
          const list = [
            modelAttributeStyle.setModelComponentsAttributeName(
              modelId,
              ids,
              color_mode,
              "Line",
              name,
            ),
          ];
          if (minimum !== undefined && maximum !== undefined) {
            list.push(
              modelAttributeStyle.setModelComponentsAttributeRange(
                modelId,
                ids,
                color_mode,
                "Line",
                minimum,
                maximum,
              ),
            );
          }
          if (colorMap) {
            list.push(
              modelAttributeStyle.setModelComponentsAttributeColorMap(
                modelId,
                ids,
                color_mode,
                "Line",
                colorMap,
              ),
            );
          }
          return list;
        },
      ),
    ];

    return Promise.all(promises);
  }

  return {
    applyModelLinesStyle,
    setModelLinesDefaultStyle,
    ...modelCommonStyle,
    ...modelVisibilityStyle,
    ...modelColorStyle,
  };
}
