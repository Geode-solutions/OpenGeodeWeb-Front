import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { AttributeName } from "@ogw_front/types/attribute";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";
import { isAttributeValid } from "@ogw_internal/stores/data_style/attribute_valid";
// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  useMeshEdgesEdgeAttributeConfig,
  useMeshEdgesEdgeAttributeConfigValues,
  useMeshEdgesEdgeAttributeConfigWriter,
} from "./edge_config";
import type { UseMeshEdgesEdgeAttributeStyleReturn } from "./edge_attribute";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useAttributeTimeStepStyle } from "@ogw_internal/stores/data_style/time_step";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeNamesSchema = back_schemas.opengeodeweb_back.edge_attribute_names;
const meshEdgesEdgeAttributeSchemas = viewer_schemas.opengeodeweb_viewer.mesh.edges.attribute.edge;

// oxlint-disable-next-line max-lines-per-function
function useMeshEdgesEdgeAttributeStyle(): UseMeshEdgesEdgeAttributeStyleReturn {
  const { attributeTimeStep, setAttributeTimeStep, seriesArrayName } = useAttributeTimeStepStyle();
  const viewerStore = useViewerStore();
  const {
    meshEdgesEdgeAttribute,
    meshEdgesEdgeAttributeName,
    meshEdgesEdgeAttributeLastItem,
    meshEdgesEdgeAttributeItem,
    meshEdgesEdgeAttributeStoredConfig,
  } = useMeshEdgesEdgeAttributeConfig();
  const {
    meshEdgesEdgeAttributeRange,
    meshEdgesEdgeAttributeColorMap,
    meshEdgesEdgeAttributeNoDataColor,
  } = useMeshEdgesEdgeAttributeConfigValues();
  const { mutateMeshEdgesEdgeStyle, setMeshEdgesEdgeAttributeStoredConfig } =
    useMeshEdgesEdgeAttributeConfigWriter();
  function meshEdgesEdgeAttributeTimeStep(meshId: MeshId): number | undefined {
    return attributeTimeStep(meshId, attributeNamesSchema.$id, meshEdgesEdgeAttribute(meshId).name);
  }
  async function setMeshEdgesEdgeAttribute(
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
    await mutateMeshEdgesEdgeStyle(meshId, {
      name,
      item,
    });
    await setMeshEdgesEdgeAttributeStoredConfig(meshId, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const schema = meshEdgesEdgeAttributeSchemas.attribute;
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
  async function applyEdgeAttribute(meshId: MeshId): Promise<unknown> {
    const name = meshEdgesEdgeAttributeName(meshId);
    const item = meshEdgesEdgeAttributeItem(meshId);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(meshId, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isAttributeValid(attribute)) {
      const result = await setMeshEdgesEdgeAttribute(meshId, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshEdgesEdgeAttributeName(
    meshId: MeshId,
    name: AttributeName,
  ): Promise<unknown> {
    const item = meshEdgesEdgeAttributeLastItem(meshId, name);
    await mutateMeshEdgesEdgeStyle(meshId, {
      name,
      item,
    });
    return applyEdgeAttribute(meshId);
  }
  async function setMeshEdgesEdgeAttributeItem(meshId: MeshId, item: number): Promise<unknown> {
    await mutateMeshEdgesEdgeStyle(meshId, {
      item,
    });
    return applyEdgeAttribute(meshId);
  }
  async function setMeshEdgesEdgeAttributeTimeStep(
    meshId: MeshId,
    timeStep: number,
  ): Promise<unknown> {
    const name = meshEdgesEdgeAttributeName(meshId);
    if (name === undefined) {
      return undefined;
    }
    await setAttributeTimeStep(meshId, attributeNamesSchema.$id, name, timeStep);
    return applyEdgeAttribute(meshId);
  }
  async function setMeshEdgesEdgeAttributeRange(
    meshId: MeshId,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshEdgesEdgeAttributeName(meshId);
    const item = meshEdgesEdgeAttributeItem(meshId);
    await setMeshEdgesEdgeAttributeStoredConfig(meshId, name, item, {
      minimum,
      maximum,
    });
    return applyEdgeAttribute(meshId);
  }
  async function setMeshEdgesEdgeAttributeColorMap(
    meshId: MeshId,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshEdgesEdgeAttributeName(meshId);
    const item = meshEdgesEdgeAttributeItem(meshId);
    await setMeshEdgesEdgeAttributeStoredConfig(meshId, name, item, {
      colorMap,
    });
    return applyEdgeAttribute(meshId);
  }
  async function setMeshEdgesEdgeAttributeNoDataColor(
    meshId: MeshId,
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    const name = meshEdgesEdgeAttributeName(meshId);
    const item = meshEdgesEdgeAttributeItem(meshId);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(meshId, name, item);
    await setMeshEdgesEdgeAttributeStoredConfig(meshId, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyEdgeAttribute(meshId);
  }
  return {
    meshEdgesEdgeAttributeName,
    meshEdgesEdgeAttributeTimeStep,
    setMeshEdgesEdgeAttributeTimeStep,
    meshEdgesEdgeAttributeItem,
    meshEdgesEdgeAttributeRange,
    meshEdgesEdgeAttributeColorMap,
    meshEdgesEdgeAttributeStoredConfig,
    setMeshEdgesEdgeAttribute,
    setMeshEdgesEdgeAttributeName,
    setMeshEdgesEdgeAttributeItem,
    setMeshEdgesEdgeAttributeRange,
    setMeshEdgesEdgeAttributeColorMap,
    meshEdgesEdgeAttributeNoDataColor,
    setMeshEdgesEdgeAttributeNoDataColor,
  };
}
export { useMeshEdgesEdgeAttributeStyle };
