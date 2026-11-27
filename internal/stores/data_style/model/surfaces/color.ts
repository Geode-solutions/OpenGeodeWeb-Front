import type { ModelId, SurfaceId } from "@ogw_front/types/identifiers";
import type { ColorRGBA } from "@geode/opengeodeweb-viewer/schema_types";
import type { ColoringType } from "@ogw_front/types/attribute";
import type { GeodeId } from "@geode/opengeodeweb-microservice/schema_types";
import type { NonEmptyArray } from "@ogw_front/utils/arrays";
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
    surfaceIds: SurfaceId[],
    color: ColorRGBA | undefined,
    activeColoring?: ColoringType,
    collectionId?: GeodeId,
  ) => Promise<unknown>;
  modelSurfaceColoring: (modelId: ModelId, surface_id?: SurfaceId) => StyleValues;
  modelSurfaceColor: (modelId: ModelId, surface_id?: SurfaceId) => ColorRGBA | undefined;
  modelSurfaceActiveColoring: (modelId: ModelId, surface_id?: SurfaceId) => unknown;
  setModelSurfacesActiveColoring: (
    modelId: ModelId,
    surfaceIds: NonEmptyArray<SurfaceId>,
    activeColoring: ColoringType,
    collectionId?: GeodeId,
  ) => Promise<unknown>;
} {
  const dataStore = useDataStore();
  const modelCommonStyle = useModelCommonStyle();
  const modelSurfacesCommonStyle = useModelSurfacesCommonStyle();
  const modelSurfacesVertexAttribute = useModelSurfacesVertexAttribute();
  const modelSurfacesPolygonAttribute = useModelSurfacesPolygonAttribute();

  function modelSurfaceColoring(modelId: ModelId, surface_id?: SurfaceId): StyleValues {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring shape is defined by the data style schema.
    return modelSurfacesCommonStyle.modelSurfaceStyle(modelId, surface_id).coloring as StyleValues;
  }

  function modelSurfaceColor(modelId: ModelId, surface_id?: SurfaceId): ColorRGBA | undefined {
    // oxlint-disable-next-line no-unsafe-type-assertion -- coloring.constant shape is defined by the data style schema.
    return modelSurfaceColoring(modelId, surface_id).constant as ColorRGBA | undefined;
  }

  async function setModelSurfacesColor(
    modelId: ModelId,
    surfaceIds: SurfaceId[],
    color: ColorRGBA | undefined,
    activeColoring = "constant",
    collectionId?: GeodeId,
  ): Promise<unknown> {
    const result = await modelCommonStyle.setModelTypeColor(
      modelId,
      surfaceIds,
      color,
      schema,
      activeColoring,
      collectionId,
    );
    return result;
  }

  function modelSurfaceActiveColoring(modelId: ModelId, surface_id?: SurfaceId): unknown {
    return modelSurfaceColoring(modelId, surface_id).active;
  }

  async function applyVertexColoring(
    modelId: ModelId,
    surfaceIds: NonEmptyArray<SurfaceId>,
  ): Promise<unknown> {
    const name = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeName(
      modelId,
      surfaceIds[0],
    );
    const item = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeItem(
      modelId,
      surfaceIds[0],
    );
    const [minimum, maximum] = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeRange(
      modelId,
      surfaceIds[0],
    );
    const colorMap = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeColorMap(
      modelId,
      surfaceIds[0],
    );
    const no_data_color = modelSurfacesVertexAttribute.modelSurfacesVertexAttributeNoDataColor(
      modelId,
      surfaceIds[0],
    );
    const attribute = { name, item, minimum, maximum, colorMap, no_data_color };
    if (isAttributeValid(attribute)) {
      const result = await modelSurfacesVertexAttribute.setModelSurfacesVertexAttribute(
        modelId,
        surfaceIds,
        attribute,
      );
      return result;
    }
    return undefined;
  }

  async function applyPolygonColoring(
    modelId: ModelId,
    surfaceIds: NonEmptyArray<SurfaceId>,
  ): Promise<unknown> {
    const name = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeName(
      modelId,
      surfaceIds[0],
    );
    const item = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeItem(
      modelId,
      surfaceIds[0],
    );
    const [minimum, maximum] = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeRange(
      modelId,
      surfaceIds[0],
    );
    const colorMap = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeColorMap(
      modelId,
      surfaceIds[0],
    );
    const no_data_color = modelSurfacesPolygonAttribute.modelSurfacesPolygonAttributeNoDataColor(
      modelId,
      surfaceIds[0],
    );
    const attribute = { name, item, minimum, maximum, colorMap, no_data_color };
    if (isAttributeValid(attribute)) {
      const result = await modelSurfacesPolygonAttribute.setModelSurfacesPolygonAttribute(
        modelId,
        surfaceIds,
        attribute,
      );
      return result;
    }
    return undefined;
  }

  async function setModelSurfacesActiveColoring(
    modelId: ModelId,
    surfaceIds: NonEmptyArray<SurfaceId>,
    activeColoring: ColoringType,
    collectionId?: GeodeId,
  ): Promise<unknown> {
    const totalSurfaceIds = await dataStore.getSurfacesGeodeIds(modelId);
    if (surfaceIds.length === totalSurfaceIds.length) {
      await modelSurfacesCommonStyle.mutateModelSurfacesTypeColoring(modelId, {
        active: activeColoring,
      });
    }
    await modelCommonStyle.mutateComponentStyles(modelId, surfaceIds, {
      coloring: { active: activeColoring },
    });
    if (activeColoring === "constant" || activeColoring === "random") {
      const color = modelSurfaceColor(modelId, surfaceIds[0]);
      return setModelSurfacesColor(modelId, surfaceIds, color, activeColoring, collectionId);
    }

    if (activeColoring === "vertex") {
      return applyVertexColoring(modelId, surfaceIds);
    } else if (activeColoring === "polygon") {
      return applyPolygonColoring(modelId, surfaceIds);
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
