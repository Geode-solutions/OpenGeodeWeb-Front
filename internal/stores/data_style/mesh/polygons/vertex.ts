import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { DataId } from "@ogw_front/types/identifiers";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";
// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  type UseMeshPolygonsVertexAttributeStyleReturn,
  isMeshPolygonsVertexAttributeValid,
} from "./vertex_attribute";
import {
  useMeshPolygonsVertexAttributeConfig,
  useMeshPolygonsVertexAttributeConfigValues,
  useMeshPolygonsVertexAttributeConfigWriter,
} from "./vertex_config";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useAttributeTimeStepStyle } from "@ogw_internal/stores/data_style/time_step";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeNamesSchema = back_schemas.opengeodeweb_back.vertex_attribute_names;
const meshPolygonsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.attribute.vertex;

// oxlint-disable-next-line max-lines-per-function
function useMeshPolygonsVertexAttributeStyle(): UseMeshPolygonsVertexAttributeStyleReturn {
  const { attributeTimeStep, setAttributeTimeStep, seriesArrayName } = useAttributeTimeStepStyle();
  const viewerStore = useViewerStore();
  const {
    meshPolygonsVertexAttribute,
    meshPolygonsVertexAttributeName,
    meshPolygonsVertexAttributeLastItem,
    meshPolygonsVertexAttributeItem,
    meshPolygonsVertexAttributeStoredConfig,
  } = useMeshPolygonsVertexAttributeConfig();
  const {
    meshPolygonsVertexAttributeRange,
    meshPolygonsVertexAttributeColorMap,
    meshPolygonsVertexAttributeNoDataColor,
  } = useMeshPolygonsVertexAttributeConfigValues();
  const { mutateMeshPolygonsVertexStyle, setMeshPolygonsVertexAttributeStoredConfig } =
    useMeshPolygonsVertexAttributeConfigWriter();
  function meshPolygonsVertexAttributeTimeStep(meshId: DataId): number | undefined {
    return attributeTimeStep(
      meshId,
      attributeNamesSchema.$id,
      meshPolygonsVertexAttribute(meshId).name,
    );
  }
  async function setMeshPolygonsVertexAttribute(
    meshId: DataId,
    {
      name,
      item,
      minimum,
      maximum,
      colorMap,
      no_data_color = DEFAULT_NO_DATA_COLOR,
    }: ValidAttributeInput,
  ): Promise<unknown> {
    await mutateMeshPolygonsVertexStyle(meshId, {
      name,
      item,
    });
    await setMeshPolygonsVertexAttributeStoredConfig(meshId, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const schema = meshPolygonsVertexAttributeSchemas.attribute;
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
  async function applyVertexAttribute(meshId: DataId): Promise<unknown> {
    const name = meshPolygonsVertexAttributeName(meshId);
    const item = meshPolygonsVertexAttributeItem(meshId);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(meshId, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshPolygonsVertexAttributeValid(attribute)) {
      const result = await setMeshPolygonsVertexAttribute(meshId, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshPolygonsVertexAttributeName(
    meshId: DataId,
    name: string,
  ): Promise<unknown> {
    const item = meshPolygonsVertexAttributeLastItem(meshId, name);
    await mutateMeshPolygonsVertexStyle(meshId, {
      name,
      item,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshPolygonsVertexAttributeItem(
    meshId: DataId,
    item: number,
  ): Promise<unknown> {
    await mutateMeshPolygonsVertexStyle(meshId, {
      item,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshPolygonsVertexAttributeTimeStep(
    meshId: DataId,
    timeStep: number,
  ): Promise<unknown> {
    const name = meshPolygonsVertexAttributeName(meshId);
    if (name === undefined) {
      return undefined;
    }
    await setAttributeTimeStep(meshId, attributeNamesSchema.$id, name, timeStep);
    return applyVertexAttribute(meshId);
  }
  async function setMeshPolygonsVertexAttributeRange(
    meshId: DataId,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshPolygonsVertexAttributeName(meshId);
    const item = meshPolygonsVertexAttributeItem(meshId);
    await setMeshPolygonsVertexAttributeStoredConfig(meshId, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshPolygonsVertexAttributeColorMap(
    meshId: DataId,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshPolygonsVertexAttributeName(meshId);
    const item = meshPolygonsVertexAttributeItem(meshId);
    await setMeshPolygonsVertexAttributeStoredConfig(meshId, name, item, {
      colorMap,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshPolygonsVertexAttributeNoDataColor(
    meshId: DataId,
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    const name = meshPolygonsVertexAttributeName(meshId);
    const item = meshPolygonsVertexAttributeItem(meshId);
    const storedConfig = meshPolygonsVertexAttributeStoredConfig(meshId, name, item);
    await setMeshPolygonsVertexAttributeStoredConfig(meshId, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(meshId);
  }
  return {
    meshPolygonsVertexAttributeName,
    meshPolygonsVertexAttributeTimeStep,
    setMeshPolygonsVertexAttributeTimeStep,
    meshPolygonsVertexAttributeItem,
    meshPolygonsVertexAttributeRange,
    meshPolygonsVertexAttributeColorMap,
    meshPolygonsVertexAttributeStoredConfig,
    setMeshPolygonsVertexAttribute,
    setMeshPolygonsVertexAttributeName,
    setMeshPolygonsVertexAttributeItem,
    setMeshPolygonsVertexAttributeRange,
    setMeshPolygonsVertexAttributeColorMap,
    meshPolygonsVertexAttributeNoDataColor,
    setMeshPolygonsVertexAttributeNoDataColor,
  };
}
export { useMeshPolygonsVertexAttributeStyle };
export { isMeshPolygonsVertexAttributeValid } from "./vertex_attribute";
