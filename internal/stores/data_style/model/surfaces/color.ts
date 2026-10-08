import { isModelSurfacesPolygonAttributeValid, useModelSurfacesPolygonAttribute } from "./polygon";
import { isModelSurfacesVertexAttributeValid, useModelSurfacesVertexAttribute } from "./vertex";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelSurfacesCommonStyle } from "./common";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

const schema = viewer_schemas.opengeodeweb_viewer.model.surfaces.color;

export function useModelSurfacesColor(): {
  setModelSurfacesColor: (
    modelId: string,
    surfaces_ids: string[],
    color: RGBAColor | undefined,
    activeColoring?: string,
    collectionId?: string,
  ) => Promise<unknown>;
  modelSurfaceColoring: (id: string, surface_id?: string) => StyleValues;
  modelSurfaceColor: (id: string, surface_id?: string) => RGBAColor | undefined;
  modelSurfaceActiveColoring: (id: string, surface_id?: string) => unknown;
  setModelSurfacesActiveColoring: (
    modelId: string,
    surfaces_ids: string[],
    activeColoring: string,
    collectionId?: string,
  ) => Promise<unknown>;
} {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelCommonStyle();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();
  const modelSurfacesVertexAttribute = useModelSurfacesVertexAttribute();
  const modelSurfacesPolygonAttribute = useModelSurfacesPolygonAttribute();

  function modelSurfaceColoring(id: string, surface_id?: string): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return modelSurfacesCommonStyle.modelSurfaceStyle(id, surface_id).coloring as StyleValues;
  }

  function modelSurfaceColor(id: string, surface_id?: string): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return modelSurfaceColoring(id, surface_id).constant as RGBAColor | undefined;
  }

  async function setModelSurfacesColor(
    modelId: string,
    surfaces_ids: string[],
    color: RGBAColor | undefined,
    activeColoring = "constant",
    collectionId?: string,
  ): Promise<unknown> {
    const result = await modelCommonStyle.setModelTypeColor(
      modelId,
      surfaces_ids,
      color,
      schema,
      activeColoring,
      collectionId,
    );
    return result;
  }

  function modelSurfaceActiveColoring(id: string, surface_id?: string): unknown {
    return modelSurfaceColoring(id, surface_id).active;
  }

  async function setModelSurfacesActiveColoring(
    modelId: string,
    surfaces_ids: string[],
    activeColoring: string,
    collectionId?: string,
  ): Promise<unknown> {
    const totalSurfaceIds = await dataStore.getSurfacesGeodeIds(modelId);
    if (surfaces_ids.length === totalSurfaceIds.length) {
      await modelSurfacesCommonStyle.mutateModelSurfacesTypeColoring(modelId, {
        active: activeColoring,
      });
    }
    await modelCommonStyle.mutateComponentStyles(modelId, surfaces_ids, {
      coloring: { active: activeColoring },
    });
    if (activeColoring === "constant" || activeColoring === "random") {
      const color = modelSurfaceColor(modelId, surfaces_ids[0]);
      return setModelSurfacesColor(modelId, surfaces_ids, color, activeColoring, collectionId);
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
      const no_data_color = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeNoDataColor(
        modelId,
        surfaces_ids[0],
      );
      const attribute = { name, item, minimum, maximum, colorMap, no_data_color };
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
      const no_data_color = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeNoDataColor(
        modelId,
        surfaces_ids[0],
      );
      const attribute = { name, item, minimum, maximum, colorMap, no_data_color };
      if (isModelSurfacesPolygonAttributeValid(attribute)) {
        return modelSurfacesPolygonAttribute.setModelSurfacesPolygonAttribute(
          modelId,
          surfaces_ids,
          attribute,
        );
      }
    }
    return undefined;
  }

  return {
    setModelSurfacesColor,
    modelSurfaceColoring,
    modelSurfaceColor,
    modelSurfaceActiveColoring,
    setModelSurfacesActiveColoring,
  };
}
