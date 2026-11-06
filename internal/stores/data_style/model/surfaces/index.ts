import type { DataId, ModelComponentId } from "@ogw_front/types/identifiers";
import {
  applyModelSurfacesConstantColoring,
  applyModelSurfacesPolygonColoring,
  applyModelSurfacesVertexColoring,
} from "./apply_coloring";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelSurfacesColor } from "./color";
import { useModelSurfacesCommonStyle } from "./common";
import { useModelSurfacesEdgesStyle } from "./edges";
import { useModelSurfacesPointsStyle } from "./points";
import { useModelSurfacesPolygonAttribute } from "./polygon";
import { useModelSurfacesVertexAttribute } from "./vertex";
import { useModelSurfacesVisibility } from "./visibility";

async function setModelSurfacesDefaultStyle(_id: string): Promise<void> {
  // Placeholder
}

type UseModelSurfacesStyleReturn = ReturnType<typeof useModelSurfacesCommonStyle> &
  ReturnType<typeof useModelSurfacesVisibility> &
  ReturnType<typeof useModelSurfacesColor> &
  ReturnType<typeof useModelSurfacesPointsStyle> &
  ReturnType<typeof useModelSurfacesEdgesStyle> &
  ReturnType<typeof useModelSurfacesVertexAttribute> &
  ReturnType<typeof useModelSurfacesPolygonAttribute> & {
    applyModelSurfacesStyle: (modelId: DataId) => Promise<void>;
    setModelSurfacesDefaultStyle: (modelId: DataId) => Promise<void>;
  };

// oxlint-disable-next-line max-lines-per-function
export function useModelSurfacesStyle(): UseModelSurfacesStyleReturn {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelSurfacesCommonStyle();
  const modelVisibilityStyle = useModelSurfacesVisibility();
  const modelColorStyle = useModelSurfacesColor();
  const modelSurfacesVertexAttribute = useModelSurfacesVertexAttribute();
  const modelSurfacesPolygonAttribute = useModelSurfacesPolygonAttribute();
  const modelSurfacesPointsStyle = useModelSurfacesPointsStyle();
  const modelSurfacesEdgesStyle = useModelSurfacesEdgesStyle();

  async function applyModelSurfacesVisibilityStyle(
    modelId: DataId,
    surfaces_ids: ModelComponentId[],
  ): Promise<void> {
    const visibilityGroups: Record<string, string[]> = {};
    for (const surfaces_id of surfaces_ids) {
      const style = modelCommonStyle.modelSurfaceStyle(modelId, surfaces_id);
      const visibility = String(style.visibility);
      visibilityGroups[visibility] ??= [];
      visibilityGroups[visibility].push(surfaces_id);
    }
    await Promise.all(
      Object.entries(visibilityGroups).map(async ([visibility, ids]) => {
        const result = await modelVisibilityStyle.setModelSurfacesVisibility(
          modelId,
          ids,
          visibility === "true",
        );
        return result;
      }),
    );
  }

  async function applyModelSurfacesColoringStyle(
    modelId: DataId,
    surfaces_ids: ModelComponentId[],
  ): Promise<unknown[]> {
    const activeColoringGroups: Record<string, string[]> = {};
    for (const surfaces_id of surfaces_ids) {
      const activeColoring = String(
        modelColorStyle.modelSurfaceActiveColoring(modelId, surfaces_id),
      );
      activeColoringGroups[activeColoring] ??= [];
      activeColoringGroups[activeColoring].push(surfaces_id);
    }

    const coloringPromises: Promise<unknown>[] = [];

    for (const [type, type_surfaces_ids] of Object.entries(activeColoringGroups)) {
      if (type === "constant") {
        coloringPromises.push(
          ...applyModelSurfacesConstantColoring(modelId, type_surfaces_ids, modelColorStyle),
        );
      } else if (type === "random") {
        coloringPromises.push(
          modelColorStyle.setModelSurfacesColor(modelId, type_surfaces_ids, undefined, "random"),
        );
      } else if (type === "vertex") {
        coloringPromises.push(
          ...applyModelSurfacesVertexColoring(
            modelId,
            type_surfaces_ids,
            modelSurfacesVertexAttribute,
          ),
        );
      } else if (type === "polygon") {
        coloringPromises.push(
          ...applyModelSurfacesPolygonColoring(
            modelId,
            type_surfaces_ids,
            modelSurfacesPolygonAttribute,
          ),
        );
      }
    }
    const results = await Promise.all(coloringPromises);
    return results;
  }

  async function applyModelSurfacesStyle(modelId: DataId): Promise<void> {
    const surfaces_ids = await dataStore.getSurfacesGeodeIds(modelId);
    if (surfaces_ids.length === 0) {
      return;
    }
    await Promise.all([
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
    ...modelSurfacesPointsStyle,
    ...modelSurfacesEdgesStyle,
  };
}
