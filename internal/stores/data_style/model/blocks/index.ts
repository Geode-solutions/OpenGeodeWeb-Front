import type { ModelComponentId, ModelId } from "@ogw_front/types/identifiers";
import {
  applyModelBlocksConstantColoring,
  applyModelBlocksPolyhedronColoring,
  applyModelBlocksVertexColoring,
} from "./apply_coloring";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelBlocksColor } from "./color";
import { useModelBlocksCommonStyle } from "./common";
import { useModelBlocksEdgesStyle } from "./edges";
import { useModelBlocksPointsStyle } from "./points";
import { useModelBlocksPolyhedronAttribute } from "./polyhedron";
import { useModelBlocksVertexAttribute } from "./vertex";
import { useModelBlocksVisibility } from "./visibility";

async function setModelBlocksDefaultStyle(_id: string): Promise<void> {
  // Placeholder
}

type UseModelBlocksStyleReturn = {
  applyModelBlocksStyle: (modelId: ModelId) => Promise<void>;
  setModelBlocksDefaultStyle: (modelId: ModelId) => Promise<void>;
} & ReturnType<typeof useModelBlocksCommonStyle> &
  ReturnType<typeof useModelBlocksVisibility> &
  ReturnType<typeof useModelBlocksColor> &
  ReturnType<typeof useModelBlocksPointsStyle> &
  ReturnType<typeof useModelBlocksEdgesStyle> &
  ReturnType<typeof useModelBlocksVertexAttribute> &
  ReturnType<typeof useModelBlocksPolyhedronAttribute>;

// oxlint-disable-next-line max-lines-per-function
export function useModelBlocksStyle(): UseModelBlocksStyleReturn {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelBlocksCommonStyle();
  const modelVisibilityStyle = useModelBlocksVisibility();
  const modelColorStyle = useModelBlocksColor();
  const modelBlocksVertexAttribute = useModelBlocksVertexAttribute();
  const modelBlocksPolyhedronAttribute = useModelBlocksPolyhedronAttribute();
  const modelBlocksPointsStyle = useModelBlocksPointsStyle();
  const modelBlocksEdgesStyle = useModelBlocksEdgesStyle();

  async function applyModelBlocksVisibilityStyle(
    modelId: ModelId,
    blocks_ids: ModelComponentId[],
  ): Promise<unknown[]> {
    const visibilityGroups: Record<string, string[]> = {};
    for (const block_id of blocks_ids) {
      const style = modelCommonStyle.modelBlockStyle(modelId, block_id);
      const visibility = String(style.visibility);
      visibilityGroups[visibility] ??= [];
      visibilityGroups[visibility].push(block_id);
    }
    const result = await Promise.all(
      Object.entries(visibilityGroups).map(async ([visibility, ids]) => {
        const visibilityResult = await modelVisibilityStyle.setModelBlocksVisibility(
          modelId,
          ids,
          visibility === "true",
        );
        return visibilityResult;
      }),
    );
    return result;
  }

  async function applyModelBlocksColoringStyle(
    modelId: ModelId,
    blocks_ids: ModelComponentId[],
  ): Promise<unknown[]> {
    const activeColoringGroups: Record<string, string[]> = {};
    for (const block_id of blocks_ids) {
      const activeColoring = String(modelColorStyle.modelBlockActiveColoring(modelId, block_id));
      activeColoringGroups[activeColoring] ??= [];
      activeColoringGroups[activeColoring].push(block_id);
    }

    const coloringPromises: Promise<unknown>[] = [];

    for (const [type, type_blocks_ids] of Object.entries(activeColoringGroups)) {
      if (type === "constant") {
        coloringPromises.push(
          ...applyModelBlocksConstantColoring(modelId, type_blocks_ids, modelColorStyle),
        );
      } else if (type === "random") {
        coloringPromises.push(
          modelColorStyle.setModelBlocksColor(modelId, type_blocks_ids, undefined, "random"),
        );
      } else if (type === "vertex") {
        coloringPromises.push(
          ...applyModelBlocksVertexColoring(modelId, type_blocks_ids, modelBlocksVertexAttribute),
        );
      } else if (type === "polyhedron") {
        coloringPromises.push(
          ...applyModelBlocksPolyhedronColoring(
            modelId,
            type_blocks_ids,
            modelBlocksPolyhedronAttribute,
          ),
        );
      }
    }

    const result = await Promise.all(coloringPromises);
    return result;
  }

  async function applyModelBlocksStyle(modelId: ModelId): Promise<void> {
    const blocks_ids = await dataStore.getBlocksGeodeIds(modelId);
    if (blocks_ids.length === 0) {
      return;
    }

    await Promise.all([
      applyModelBlocksVisibilityStyle(modelId, blocks_ids),
      applyModelBlocksColoringStyle(modelId, blocks_ids),
    ]);
  }

  return {
    applyModelBlocksStyle,
    setModelBlocksDefaultStyle,
    ...modelCommonStyle,
    ...modelVisibilityStyle,
    ...modelColorStyle,
    ...modelBlocksVertexAttribute,
    ...modelBlocksPolyhedronAttribute,
    ...modelBlocksPointsStyle,
    ...modelBlocksEdgesStyle,
  };
}
