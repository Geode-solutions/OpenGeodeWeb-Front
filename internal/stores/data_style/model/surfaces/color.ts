import type { ModelComponentId, ModelId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { StyleValues } from "@ogw_internal/stores/data_style/types.js";
import { isAttributeValid } from "@ogw_internal/stores/data_style/attribute_valid";
import { useDataStore } from "@ogw_front/stores/data";
import { useModelCommonStyle } from "@ogw_internal/stores/data_style/model/common";
import { useModelSurfacesCommonStyle } from "./common";
import { useModelSurfacesPolygonAttribute } from "./polygon";
import { useModelSurfacesVertexAttribute } from "./vertex";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

const schema = viewer_schemas.opengeodeweb_viewer.model.surfaces.color;

export function useModelSurfacesColor(): {
  setModelSurfacesColor: (
    modelId: ModelId,
    surfaces_ids: ModelComponentId[],
    color: RGBAColor | undefined,
    activeColoring?: string,
    collectionId?: string,
  ) => Promise<unknown>;
  modelSurfaceColoring: (modelId: ModelId, surface_id?: ModelComponentId) => StyleValues;
  modelSurfaceColor: (modelId: ModelId, surface_id?: ModelComponentId) => RGBAColor | undefined;
  modelSurfaceActiveColoring: (modelId: ModelId, surface_id?: ModelComponentId) => unknown;
  setModelSurfacesActiveColoring: (
    modelId: ModelId,
    surfaces_ids: ModelComponentId[],
    activeColoring: string,
    collectionId?: string,
  ) => Promise<unknown>;
} {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelCommonStyle();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();
  const modelSurfacesVertexAttribute = useModelSurfacesVertexAttribute();
  const modelSurfacesPolygonAttribute = useModelSurfacesPolygonAttribute();

  function modelSurfaceColoring(modelId: ModelId, surface_id?: ModelComponentId): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return modelSurfacesCommonStyle.modelSurfaceStyle(modelId, surface_id).coloring as StyleValues;
  }

  function modelSurfaceColor(
    modelId: ModelId,
    surface_id?: ModelComponentId,
  ): RGBAColor | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return modelSurfaceColoring(modelId, surface_id).constant as RGBAColor | undefined;
  }

  async function setModelSurfacesColor(
    modelId: ModelId,
    surfaces_ids: ModelComponentId[],
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

  function modelSurfaceActiveColoring(modelId: ModelId, surface_id?: ModelComponentId): unknown {
    return modelSurfaceColoring(modelId, surface_id).active;
  }

  async function applyVertexColoring(
    modelId: ModelId,
    surfaces_ids: ModelComponentId[],
  ): Promise<unknown> {
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
    if (isAttributeValid(attribute)) {
      const result = await modelSurfacesVertexAttribute.setModelSurfacesVertexAttribute(
        modelId,
        surfaces_ids,
        attribute,
      );
      return result;
    }
    return undefined;
  }

  async function applyPolygonColoring(
    modelId: ModelId,
    surfaces_ids: ModelComponentId[],
  ): Promise<unknown> {
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
    if (isAttributeValid(attribute)) {
      const result = await modelSurfacesPolygonAttribute.setModelSurfacesPolygonAttribute(
        modelId,
        surfaces_ids,
        attribute,
      );
      return result;
    }
    return undefined;
  }

  async function setModelSurfacesActiveColoring(
    modelId: ModelId,
    surfaces_ids: ModelComponentId[],
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
      return applyVertexColoring(modelId, surfaces_ids);
    } else if (activeColoring === "polygon") {
      return applyPolygonColoring(modelId, surfaces_ids);
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
