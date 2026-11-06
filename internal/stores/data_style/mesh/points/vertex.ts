import type { AttributeItem, AttributeName } from "@ogw_front/types/attribute";
import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";
import { isAttributeValid } from "@ogw_internal/stores/data_style/attribute_valid";
// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  useMeshPointsVertexAttributeConfig,
  useMeshPointsVertexAttributeConfigValues,
  useMeshPointsVertexAttributeConfigWriter,
} from "./vertex_config";
import type { UseMeshPointsVertexAttributeStyleReturn } from "./vertex_attribute";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useAttributeTimeStepStyle } from "@ogw_internal/stores/data_style/time_step";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeNamesSchema = back_schemas.opengeodeweb_back.vertex_attribute_names;
const meshPointsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.points.attribute.vertex;

// oxlint-disable-next-line max-lines-per-function
function useMeshPointsVertexAttributeStyle(): UseMeshPointsVertexAttributeStyleReturn {
  const { attributeTimeStep, setAttributeTimeStep, seriesArrayName } = useAttributeTimeStepStyle();
  const viewerStore = useViewerStore();
  const {
    meshPointsVertexAttribute,
    meshPointsVertexAttributeName,
    meshPointsVertexAttributeLastItem,
    meshPointsVertexAttributeItem,
    meshPointsVertexAttributeStoredConfig,
  } = useMeshPointsVertexAttributeConfig();
  const {
    meshPointsVertexAttributeRange,
    meshPointsVertexAttributeColorMap,
    meshPointsVertexAttributeNoDataColor,
  } = useMeshPointsVertexAttributeConfigValues();
  const { mutateMeshPointsVertexStyle, setMeshPointsVertexAttributeStoredConfig } =
    useMeshPointsVertexAttributeConfigWriter();
  function meshPointsVertexAttributeTimeStep(meshId: MeshId): number | undefined {
    return attributeTimeStep(
      meshId,
      attributeNamesSchema.$id,
      meshPointsVertexAttribute(meshId).name,
    );
  }
  async function setMeshPointsVertexAttribute(
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
    await mutateMeshPointsVertexStyle(meshId, {
      name,
      item,
    });
    await setMeshPointsVertexAttributeStoredConfig(meshId, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const schema = meshPointsVertexAttributeSchemas.attribute;
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
  async function applyVertexAttribute(meshId: MeshId): Promise<unknown> {
    const name = meshPointsVertexAttributeName(meshId);
    const item = meshPointsVertexAttributeItem(meshId);
    const storedConfig = meshPointsVertexAttributeStoredConfig(meshId, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isAttributeValid(attribute)) {
      const result = await setMeshPointsVertexAttribute(meshId, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshPointsVertexAttributeName(
    meshId: MeshId,
    name: AttributeName,
  ): Promise<unknown> {
    const item = meshPointsVertexAttributeLastItem(meshId, name);
    await mutateMeshPointsVertexStyle(meshId, {
      name,
      item,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshPointsVertexAttributeItem(
    meshId: MeshId,
    item: AttributeItem,
  ): Promise<unknown> {
    await mutateMeshPointsVertexStyle(meshId, {
      item,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshPointsVertexAttributeTimeStep(
    meshId: MeshId,
    timeStep: number,
  ): Promise<unknown> {
    const name = meshPointsVertexAttributeName(meshId);
    if (name === undefined) {
      return undefined;
    }
    await setAttributeTimeStep(meshId, attributeNamesSchema.$id, name, timeStep);
    return applyVertexAttribute(meshId);
  }
  async function setMeshPointsVertexAttributeRange(
    meshId: MeshId,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshPointsVertexAttributeName(meshId);
    const item = meshPointsVertexAttributeItem(meshId);
    await setMeshPointsVertexAttributeStoredConfig(meshId, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshPointsVertexAttributeColorMap(
    meshId: MeshId,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshPointsVertexAttributeName(meshId);
    const item = meshPointsVertexAttributeItem(meshId);
    await setMeshPointsVertexAttributeStoredConfig(meshId, name, item, {
      colorMap,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshPointsVertexAttributeNoDataColor(
    meshId: MeshId,
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    const name = meshPointsVertexAttributeName(meshId);
    const item = meshPointsVertexAttributeItem(meshId);
    const storedConfig = meshPointsVertexAttributeStoredConfig(meshId, name, item);
    await setMeshPointsVertexAttributeStoredConfig(meshId, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(meshId);
  }
  return {
    meshPointsVertexAttributeName,
    meshPointsVertexAttributeTimeStep,
    setMeshPointsVertexAttributeTimeStep,
    meshPointsVertexAttributeItem,
    meshPointsVertexAttributeRange,
    meshPointsVertexAttributeColorMap,
    meshPointsVertexAttributeStoredConfig,
    setMeshPointsVertexAttribute,
    setMeshPointsVertexAttributeName,
    setMeshPointsVertexAttributeItem,
    setMeshPointsVertexAttributeRange,
    setMeshPointsVertexAttributeColorMap,
    meshPointsVertexAttributeNoDataColor,
    setMeshPointsVertexAttributeNoDataColor,
  };
}
export { useMeshPointsVertexAttributeStyle };
