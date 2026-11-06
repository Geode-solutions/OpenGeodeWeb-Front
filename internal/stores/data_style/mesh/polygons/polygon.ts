import type {
  AttributeColorMap,
  AttributeItem,
  AttributeName,
  AttributeRangeMaximum,
  AttributeRangeMinimum,
  AttributeTimeStep,
} from "@ogw_front/types/attribute";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";
import { isAttributeValid } from "@ogw_internal/stores/data_style/attribute_valid";
// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  useMeshPolygonsPolygonAttributeConfig,
  useMeshPolygonsPolygonAttributeConfigValues,
  useMeshPolygonsPolygonAttributeConfigWriter,
} from "./polygon_config";
import type { UseMeshPolygonsPolygonAttributeStyleReturn } from "./polygon_attribute";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useAttributeTimeStepStyle } from "@ogw_internal/stores/data_style/time_step";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeNamesSchema = back_schemas.opengeodeweb_back.polygon_attribute_names;
const meshPolygonsPolygonAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.attribute.polygon;

// oxlint-disable-next-line max-lines-per-function
function useMeshPolygonsPolygonAttributeStyle(): UseMeshPolygonsPolygonAttributeStyleReturn {
  const { attributeTimeStep, setAttributeTimeStep, seriesArrayName } = useAttributeTimeStepStyle();
  const viewerStore = useViewerStore();
  const {
    meshPolygonsPolygonAttribute,
    meshPolygonsPolygonAttributeName,
    meshPolygonsPolygonAttributeLastItem,
    meshPolygonsPolygonAttributeItem,
    meshPolygonsPolygonAttributeStoredConfig,
  } = useMeshPolygonsPolygonAttributeConfig();
  const {
    meshPolygonsPolygonAttributeRange,
    meshPolygonsPolygonAttributeColorMap,
    meshPolygonsPolygonAttributeNoDataColor,
  } = useMeshPolygonsPolygonAttributeConfigValues();
  const { mutateMeshPolygonsPolygonStyle, setMeshPolygonsPolygonAttributeStoredConfig } =
    useMeshPolygonsPolygonAttributeConfigWriter();
  function meshPolygonsPolygonAttributeTimeStep(meshId: MeshId): AttributeTimeStep | undefined {
    return attributeTimeStep(
      meshId,
      attributeNamesSchema.$id,
      meshPolygonsPolygonAttribute(meshId).name,
    );
  }
  async function setMeshPolygonsPolygonAttribute(
    meshId: MeshId,
    {
      name,
      item,
      minimum,
      maximum,
      colorMap,
      no_data_color = DEFAULT_NO_DATA_COLOR,
    }: ValidAttributeInput,
  ): Promise<unknown> {
    await mutateMeshPolygonsPolygonStyle(meshId, {
      name,
      item,
    });
    await setMeshPolygonsPolygonAttributeStoredConfig(meshId, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const schema = meshPolygonsPolygonAttributeSchemas.attribute;
    const params = {
      id: meshId,
      name: seriesArrayName(meshId, attributeNamesSchema.$id, name),
      item,
      points,
      minimum,
      maximum,
      no_data_color,
    };
    return viewerStore.request({
      schema,
      params,
    });
  }
  async function applyPolygonAttribute(meshId: MeshId): Promise<unknown> {
    const name = meshPolygonsPolygonAttributeName(meshId);
    const item = meshPolygonsPolygonAttributeItem(meshId);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(meshId, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isAttributeValid(attribute)) {
      const result = await setMeshPolygonsPolygonAttribute(meshId, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshPolygonsPolygonAttributeName(
    meshId: MeshId,
    name: AttributeName,
  ): Promise<unknown> {
    const item = meshPolygonsPolygonAttributeLastItem(meshId, name);
    await mutateMeshPolygonsPolygonStyle(meshId, {
      name,
      item,
    });
    return applyPolygonAttribute(meshId);
  }
  async function setMeshPolygonsPolygonAttributeItem(
    meshId: MeshId,
    item: AttributeItem,
  ): Promise<unknown> {
    await mutateMeshPolygonsPolygonStyle(meshId, {
      item,
    });
    return applyPolygonAttribute(meshId);
  }
  async function setMeshPolygonsPolygonAttributeTimeStep(
    meshId: MeshId,
    timeStep: AttributeTimeStep,
  ): Promise<unknown> {
    const name = meshPolygonsPolygonAttributeName(meshId);
    if (name === undefined) {
      return undefined;
    }
    await setAttributeTimeStep(meshId, attributeNamesSchema.$id, name, timeStep);
    return applyPolygonAttribute(meshId);
  }
  async function setMeshPolygonsPolygonAttributeRange(
    meshId: MeshId,
    minimum: AttributeRangeMinimum,
    maximum: AttributeRangeMaximum,
  ): Promise<unknown> {
    const name = meshPolygonsPolygonAttributeName(meshId);
    const item = meshPolygonsPolygonAttributeItem(meshId);
    await setMeshPolygonsPolygonAttributeStoredConfig(meshId, name, item, {
      minimum,
      maximum,
    });
    return applyPolygonAttribute(meshId);
  }
  async function setMeshPolygonsPolygonAttributeColorMap(
    meshId: MeshId,
    colorMap: AttributeColorMap | undefined,
  ): Promise<unknown> {
    const name = meshPolygonsPolygonAttributeName(meshId);
    const item = meshPolygonsPolygonAttributeItem(meshId);
    await setMeshPolygonsPolygonAttributeStoredConfig(meshId, name, item, {
      colorMap,
    });
    return applyPolygonAttribute(meshId);
  }
  async function setMeshPolygonsPolygonAttributeNoDataColor(
    meshId: MeshId,
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    const name = meshPolygonsPolygonAttributeName(meshId);
    const item = meshPolygonsPolygonAttributeItem(meshId);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(meshId, name, item);
    await setMeshPolygonsPolygonAttributeStoredConfig(meshId, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyPolygonAttribute(meshId);
  }
  return {
    meshPolygonsPolygonAttributeName,
    meshPolygonsPolygonAttributeTimeStep,
    setMeshPolygonsPolygonAttributeTimeStep,
    meshPolygonsPolygonAttributeItem,
    meshPolygonsPolygonAttributeRange,
    meshPolygonsPolygonAttributeColorMap,
    meshPolygonsPolygonAttributeStoredConfig,
    setMeshPolygonsPolygonAttribute,
    setMeshPolygonsPolygonAttributeName,
    setMeshPolygonsPolygonAttributeItem,
    setMeshPolygonsPolygonAttributeRange,
    setMeshPolygonsPolygonAttributeColorMap,
    meshPolygonsPolygonAttributeNoDataColor,
    setMeshPolygonsPolygonAttributeNoDataColor,
  };
}
export { useMeshPolygonsPolygonAttributeStyle };
