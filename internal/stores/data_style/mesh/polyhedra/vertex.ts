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
  useMeshPolyhedraVertexAttributeConfig,
  useMeshPolyhedraVertexAttributeConfigValues,
  useMeshPolyhedraVertexAttributeConfigWriter,
} from "./vertex_config";
import type { UseMeshPolyhedraVertexAttributeStyleReturn } from "./vertex_attribute";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useAttributeTimeStepStyle } from "@ogw_internal/stores/data_style/time_step";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeNamesSchema = back_schemas.opengeodeweb_back.vertex_attribute_names;
const meshPolyhedraVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.attribute.vertex;

// oxlint-disable-next-line max-lines-per-function
function useMeshPolyhedraVertexAttributeStyle(): UseMeshPolyhedraVertexAttributeStyleReturn {
  const { attributeTimeStep, setAttributeTimeStep, seriesArrayName } = useAttributeTimeStepStyle();
  const viewerStore = useViewerStore();
  const {
    meshPolyhedraVertexAttribute,
    meshPolyhedraVertexAttributeName,
    meshPolyhedraVertexAttributeLastItem,
    meshPolyhedraVertexAttributeItem,
    meshPolyhedraVertexAttributeStoredConfig,
  } = useMeshPolyhedraVertexAttributeConfig();
  const {
    meshPolyhedraVertexAttributeRange,
    meshPolyhedraVertexAttributeColorMap,
    meshPolyhedraVertexAttributeNoDataColor,
  } = useMeshPolyhedraVertexAttributeConfigValues();
  const { mutateMeshPolyhedraVertexStyle, setMeshPolyhedraVertexAttributeStoredConfig } =
    useMeshPolyhedraVertexAttributeConfigWriter();
  function meshPolyhedraVertexAttributeTimeStep(meshId: MeshId): AttributeTimeStep | undefined {
    return attributeTimeStep(
      meshId,
      attributeNamesSchema.$id,
      meshPolyhedraVertexAttribute(meshId).name,
    );
  }
  async function setMeshPolyhedraVertexAttribute(
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
    await mutateMeshPolyhedraVertexStyle(meshId, {
      name,
      item,
    });
    await setMeshPolyhedraVertexAttributeStoredConfig(meshId, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const schema = meshPolyhedraVertexAttributeSchemas.attribute;
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
    const name = meshPolyhedraVertexAttributeName(meshId);
    const item = meshPolyhedraVertexAttributeItem(meshId);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(meshId, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isAttributeValid(attribute)) {
      const result = await setMeshPolyhedraVertexAttribute(meshId, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshPolyhedraVertexAttributeName(
    meshId: MeshId,
    name: AttributeName,
  ): Promise<unknown> {
    const item = meshPolyhedraVertexAttributeLastItem(meshId, name);
    await mutateMeshPolyhedraVertexStyle(meshId, {
      name,
      item,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshPolyhedraVertexAttributeItem(
    meshId: MeshId,
    item: AttributeItem,
  ): Promise<unknown> {
    await mutateMeshPolyhedraVertexStyle(meshId, {
      item,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshPolyhedraVertexAttributeTimeStep(
    meshId: MeshId,
    timeStep: AttributeTimeStep,
  ): Promise<unknown> {
    const name = meshPolyhedraVertexAttributeName(meshId);
    if (name === undefined) {
      return undefined;
    }
    await setAttributeTimeStep(meshId, attributeNamesSchema.$id, name, timeStep);
    return applyVertexAttribute(meshId);
  }
  async function setMeshPolyhedraVertexAttributeRange(
    meshId: MeshId,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshPolyhedraVertexAttributeName(meshId);
    const item = meshPolyhedraVertexAttributeItem(meshId);
    await setMeshPolyhedraVertexAttributeStoredConfig(meshId, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshPolyhedraVertexAttributeColorMap(
    meshId: MeshId,
    colorMap: AttributeColorMap | undefined,
  ): Promise<unknown> {
    const name = meshPolyhedraVertexAttributeName(meshId);
    const item = meshPolyhedraVertexAttributeItem(meshId);
    await setMeshPolyhedraVertexAttributeStoredConfig(meshId, name, item, {
      colorMap,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshPolyhedraVertexAttributeNoDataColor(
    meshId: MeshId,
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    const name = meshPolyhedraVertexAttributeName(meshId);
    const item = meshPolyhedraVertexAttributeItem(meshId);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(meshId, name, item);
    await setMeshPolyhedraVertexAttributeStoredConfig(meshId, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(meshId);
  }
  return {
    meshPolyhedraVertexAttributeName,
    meshPolyhedraVertexAttributeTimeStep,
    setMeshPolyhedraVertexAttributeTimeStep,
    meshPolyhedraVertexAttributeItem,
    meshPolyhedraVertexAttributeRange,
    meshPolyhedraVertexAttributeColorMap,
    meshPolyhedraVertexAttributeStoredConfig,
    setMeshPolyhedraVertexAttribute,
    setMeshPolyhedraVertexAttributeName,
    setMeshPolyhedraVertexAttributeItem,
    setMeshPolyhedraVertexAttributeRange,
    setMeshPolyhedraVertexAttributeColorMap,
    meshPolyhedraVertexAttributeNoDataColor,
    setMeshPolyhedraVertexAttributeNoDataColor,
  };
}
export { useMeshPolyhedraVertexAttributeStyle };
