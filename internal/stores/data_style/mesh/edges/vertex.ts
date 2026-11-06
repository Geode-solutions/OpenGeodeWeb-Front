import type {
  AttributeColorMap,
  AttributeItem,
  AttributeName,
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
  useMeshEdgesVertexAttributeConfig,
  useMeshEdgesVertexAttributeConfigValues,
  useMeshEdgesVertexAttributeConfigWriter,
} from "./vertex_config";
import type { UseMeshEdgesVertexAttributeStyleReturn } from "./vertex_attribute";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useAttributeTimeStepStyle } from "@ogw_internal/stores/data_style/time_step";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeNamesSchema = back_schemas.opengeodeweb_back.vertex_attribute_names;
const meshEdgesVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.edges.attribute.vertex;

// oxlint-disable-next-line max-lines-per-function
function useMeshEdgesVertexAttributeStyle(): UseMeshEdgesVertexAttributeStyleReturn {
  const { attributeTimeStep, setAttributeTimeStep, seriesArrayName } = useAttributeTimeStepStyle();
  const viewerStore = useViewerStore();
  const {
    meshEdgesVertexAttribute,
    meshEdgesVertexAttributeName,
    meshEdgesVertexAttributeLastItem,
    meshEdgesVertexAttributeItem,
    meshEdgesVertexAttributeStoredConfig,
  } = useMeshEdgesVertexAttributeConfig();
  const {
    meshEdgesVertexAttributeRange,
    meshEdgesVertexAttributeColorMap,
    meshEdgesVertexAttributeNoDataColor,
  } = useMeshEdgesVertexAttributeConfigValues();
  const { mutateMeshEdgesVertexStyle, setMeshEdgesVertexAttributeStoredConfig } =
    useMeshEdgesVertexAttributeConfigWriter();
  function meshEdgesVertexAttributeTimeStep(meshId: MeshId): AttributeTimeStep | undefined {
    return attributeTimeStep(
      meshId,
      attributeNamesSchema.$id,
      meshEdgesVertexAttribute(meshId).name,
    );
  }
  async function setMeshEdgesVertexAttribute(
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
    await mutateMeshEdgesVertexStyle(meshId, {
      name,
      item,
    });
    await setMeshEdgesVertexAttributeStoredConfig(meshId, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const schema = meshEdgesVertexAttributeSchemas.attribute;
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
    const name = meshEdgesVertexAttributeName(meshId);
    const item = meshEdgesVertexAttributeItem(meshId);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(meshId, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isAttributeValid(attribute)) {
      const result = await setMeshEdgesVertexAttribute(meshId, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshEdgesVertexAttributeName(
    meshId: MeshId,
    name: AttributeName,
  ): Promise<unknown> {
    const item = meshEdgesVertexAttributeLastItem(meshId, name);
    await mutateMeshEdgesVertexStyle(meshId, {
      name,
      item,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshEdgesVertexAttributeItem(
    meshId: MeshId,
    item: AttributeItem,
  ): Promise<unknown> {
    await mutateMeshEdgesVertexStyle(meshId, {
      item,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshEdgesVertexAttributeTimeStep(
    meshId: MeshId,
    timeStep: AttributeTimeStep,
  ): Promise<unknown> {
    const name = meshEdgesVertexAttributeName(meshId);
    if (name === undefined) {
      return undefined;
    }
    await setAttributeTimeStep(meshId, attributeNamesSchema.$id, name, timeStep);
    return applyVertexAttribute(meshId);
  }
  async function setMeshEdgesVertexAttributeRange(
    meshId: MeshId,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshEdgesVertexAttributeName(meshId);
    const item = meshEdgesVertexAttributeItem(meshId);
    await setMeshEdgesVertexAttributeStoredConfig(meshId, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshEdgesVertexAttributeColorMap(
    meshId: MeshId,
    colorMap: AttributeColorMap | undefined,
  ): Promise<unknown> {
    const name = meshEdgesVertexAttributeName(meshId);
    const item = meshEdgesVertexAttributeItem(meshId);
    await setMeshEdgesVertexAttributeStoredConfig(meshId, name, item, {
      colorMap,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshEdgesVertexAttributeNoDataColor(
    meshId: MeshId,
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    const name = meshEdgesVertexAttributeName(meshId);
    const item = meshEdgesVertexAttributeItem(meshId);
    const storedConfig = meshEdgesVertexAttributeStoredConfig(meshId, name, item);
    await setMeshEdgesVertexAttributeStoredConfig(meshId, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(meshId);
  }
  return {
    meshEdgesVertexAttributeName,
    meshEdgesVertexAttributeTimeStep,
    setMeshEdgesVertexAttributeTimeStep,
    meshEdgesVertexAttributeItem,
    meshEdgesVertexAttributeRange,
    meshEdgesVertexAttributeColorMap,
    meshEdgesVertexAttributeStoredConfig,
    setMeshEdgesVertexAttribute,
    setMeshEdgesVertexAttributeName,
    setMeshEdgesVertexAttributeItem,
    setMeshEdgesVertexAttributeRange,
    setMeshEdgesVertexAttributeColorMap,
    meshEdgesVertexAttributeNoDataColor,
    setMeshEdgesVertexAttributeNoDataColor,
  };
}
export { useMeshEdgesVertexAttributeStyle };
