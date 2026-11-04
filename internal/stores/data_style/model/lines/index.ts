import {
  applyModelLinesConstantColoring,
  applyModelLinesEdgeColoring,
  applyModelLinesVertexColoring,
} from "./apply_coloring";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelLinesColor } from "./color";
import { useModelLinesCommonStyle } from "./common";
import { useModelLinesEdgeAttribute } from "./edge";
import { useModelLinesPointsStyle } from "./points";
import { useModelLinesVertexAttribute } from "./vertex";
import { useModelLinesVisibility } from "./visibility";

async function setModelLinesDefaultStyle(_id: string): Promise<void> {
  // Placeholder
}

// oxlint-disable-next-line max-lines-per-function
export function useModelLinesStyle(): ReturnType<typeof useModelLinesCommonStyle> &
  ReturnType<typeof useModelLinesVisibility> &
  ReturnType<typeof useModelLinesColor> &
  ReturnType<typeof useModelLinesPointsStyle> &
  ReturnType<typeof useModelLinesVertexAttribute> &
  ReturnType<typeof useModelLinesEdgeAttribute> & {
    applyModelLinesStyle: (modelId: string) => Promise<void>;
    setModelLinesDefaultStyle: (id: string) => Promise<void>;
  } {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelLinesCommonStyle();
  const modelVisibilityStyle = useModelLinesVisibility();
  const modelColorStyle = useModelLinesColor();
  const modelLinesVertexAttribute = useModelLinesVertexAttribute();
  const modelLinesEdgeAttribute = useModelLinesEdgeAttribute();
  const modelLinesPointsStyle = useModelLinesPointsStyle();

  async function applyModelLinesVisibilityStyle(
    modelId: string,
    lines_ids: string[],
  ): Promise<void> {
    const visibilityGroups: Record<string, string[]> = {};
    for (const line_id of lines_ids) {
      const style = modelCommonStyle.modelLineStyle(modelId, line_id);
      const visibility = String(style.visibility);
      visibilityGroups[visibility] ??= [];
      visibilityGroups[visibility].push(line_id);
    }
    await Promise.all(
      Object.entries(visibilityGroups).map(async ([visibility, ids]) => {
        const result = await modelVisibilityStyle.setModelLinesVisibility(
          modelId,
          ids,
          visibility === "true",
        );
        return result;
      }),
    );
  }

  async function applyModelLinesColoringStyle(
    modelId: string,
    lines_ids: string[],
  ): Promise<unknown[]> {
    const activeColoringGroups: Record<string, string[]> = {};
    for (const line_id of lines_ids) {
      const activeColoring = String(modelColorStyle.modelLineActiveColoring(modelId, line_id));
      activeColoringGroups[activeColoring] ??= [];
      activeColoringGroups[activeColoring].push(line_id);
    }

    const coloringPromises: Promise<unknown>[] = [];

    for (const [type, type_lines_ids] of Object.entries(activeColoringGroups)) {
      if (type === "constant") {
        coloringPromises.push(
          ...applyModelLinesConstantColoring(modelId, type_lines_ids, modelColorStyle),
        );
      } else if (type === "random") {
        coloringPromises.push(
          modelColorStyle.setModelLinesColor(modelId, type_lines_ids, undefined, "random"),
        );
      } else if (type === "vertex") {
        coloringPromises.push(
          ...applyModelLinesVertexColoring(modelId, type_lines_ids, modelLinesVertexAttribute),
        );
      } else if (type === "edge") {
        coloringPromises.push(
          ...applyModelLinesEdgeColoring(modelId, type_lines_ids, modelLinesEdgeAttribute),
        );
      }
    }
    const results = await Promise.all(coloringPromises);
    return results;
  }

  async function applyModelLinesStyle(modelId: string): Promise<void> {
    const lines_ids = await dataStore.getLinesGeodeIds(modelId);
    if (lines_ids.length === 0) {
      return;
    }
    await Promise.all([
      applyModelLinesVisibilityStyle(modelId, lines_ids),
      applyModelLinesColoringStyle(modelId, lines_ids),
    ]);
  }

  return {
    applyModelLinesStyle,
    setModelLinesDefaultStyle,
    ...modelCommonStyle,
    ...modelVisibilityStyle,
    ...modelColorStyle,
    ...modelLinesVertexAttribute,
    ...modelLinesEdgeAttribute,
    ...modelLinesPointsStyle,
  };
}
