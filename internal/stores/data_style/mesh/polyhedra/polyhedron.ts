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
  useMeshPolyhedraPolyhedronAttributeConfig,
  useMeshPolyhedraPolyhedronAttributeConfigValues,
  useMeshPolyhedraPolyhedronAttributeConfigWriter,
} from "./polyhedron_config";
import type { UseMeshPolyhedraPolyhedronAttributeStyleReturn } from "./polyhedron_attribute";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useAttributeTimeStepStyle } from "@ogw_internal/stores/data_style/time_step";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeNamesSchema = back_schemas.opengeodeweb_back.polyhedron_attribute_names;
const meshPolyhedraPolyhedronAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polyhedra.attribute.polyhedron;

// oxlint-disable-next-line max-lines-per-function
function useMeshPolyhedraPolyhedronAttributeStyle(): UseMeshPolyhedraPolyhedronAttributeStyleReturn {
  const { attributeTimeStep, setAttributeTimeStep, seriesArrayName } = useAttributeTimeStepStyle();
  const viewerStore = useViewerStore();
  const {
    meshPolyhedraPolyhedronAttribute,
    meshPolyhedraPolyhedronAttributeName,
    meshPolyhedraPolyhedronAttributeLastItem,
    meshPolyhedraPolyhedronAttributeItem,
    meshPolyhedraPolyhedronAttributeStoredConfig,
  } = useMeshPolyhedraPolyhedronAttributeConfig();
  const {
    meshPolyhedraPolyhedronAttributeRange,
    meshPolyhedraPolyhedronAttributeColorMap,
    meshPolyhedraPolyhedronAttributeNoDataColor,
  } = useMeshPolyhedraPolyhedronAttributeConfigValues();
  const { mutateMeshPolyhedraPolyhedronStyle, setMeshPolyhedraPolyhedronAttributeStoredConfig } =
    useMeshPolyhedraPolyhedronAttributeConfigWriter();
  function meshPolyhedraPolyhedronAttributeTimeStep(meshId: MeshId): number | undefined {
    return attributeTimeStep(
      meshId,
      attributeNamesSchema.$id,
      meshPolyhedraPolyhedronAttribute(meshId).name,
    );
  }
  async function setMeshPolyhedraPolyhedronAttribute(
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
    await mutateMeshPolyhedraPolyhedronStyle(meshId, {
      name,
      item,
    });
    await setMeshPolyhedraPolyhedronAttributeStoredConfig(meshId, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const schema = meshPolyhedraPolyhedronAttributeSchemas.attribute;
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
  async function applyPolyhedronAttribute(meshId: MeshId): Promise<unknown> {
    const name = meshPolyhedraPolyhedronAttributeName(meshId);
    const item = meshPolyhedraPolyhedronAttributeItem(meshId);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(meshId, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isAttributeValid(attribute)) {
      const result = await setMeshPolyhedraPolyhedronAttribute(meshId, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshPolyhedraPolyhedronAttributeName(
    meshId: MeshId,
    name: AttributeName,
  ): Promise<unknown> {
    const item = meshPolyhedraPolyhedronAttributeLastItem(meshId, name);
    await mutateMeshPolyhedraPolyhedronStyle(meshId, {
      name,
      item,
    });
    return applyPolyhedronAttribute(meshId);
  }
  async function setMeshPolyhedraPolyhedronAttributeItem(
    meshId: MeshId,
    item: AttributeItem,
  ): Promise<unknown> {
    await mutateMeshPolyhedraPolyhedronStyle(meshId, {
      item,
    });
    return applyPolyhedronAttribute(meshId);
  }
  async function setMeshPolyhedraPolyhedronAttributeTimeStep(
    meshId: MeshId,
    timeStep: number,
  ): Promise<unknown> {
    const name = meshPolyhedraPolyhedronAttributeName(meshId);
    if (name === undefined) {
      return undefined;
    }
    await setAttributeTimeStep(meshId, attributeNamesSchema.$id, name, timeStep);
    return applyPolyhedronAttribute(meshId);
  }
  async function setMeshPolyhedraPolyhedronAttributeRange(
    meshId: MeshId,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshPolyhedraPolyhedronAttributeName(meshId);
    const item = meshPolyhedraPolyhedronAttributeItem(meshId);
    await setMeshPolyhedraPolyhedronAttributeStoredConfig(meshId, name, item, {
      minimum,
      maximum,
    });
    return applyPolyhedronAttribute(meshId);
  }
  async function setMeshPolyhedraPolyhedronAttributeColorMap(
    meshId: MeshId,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshPolyhedraPolyhedronAttributeName(meshId);
    const item = meshPolyhedraPolyhedronAttributeItem(meshId);
    await setMeshPolyhedraPolyhedronAttributeStoredConfig(meshId, name, item, {
      colorMap,
    });
    return applyPolyhedronAttribute(meshId);
  }
  async function setMeshPolyhedraPolyhedronAttributeNoDataColor(
    meshId: MeshId,
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    const name = meshPolyhedraPolyhedronAttributeName(meshId);
    const item = meshPolyhedraPolyhedronAttributeItem(meshId);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(meshId, name, item);
    await setMeshPolyhedraPolyhedronAttributeStoredConfig(meshId, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyPolyhedronAttribute(meshId);
  }
  return {
    meshPolyhedraPolyhedronAttributeName,
    meshPolyhedraPolyhedronAttributeTimeStep,
    setMeshPolyhedraPolyhedronAttributeTimeStep,
    meshPolyhedraPolyhedronAttributeItem,
    meshPolyhedraPolyhedronAttributeRange,
    meshPolyhedraPolyhedronAttributeColorMap,
    meshPolyhedraPolyhedronAttributeStoredConfig,
    setMeshPolyhedraPolyhedronAttribute,
    setMeshPolyhedraPolyhedronAttributeName,
    setMeshPolyhedraPolyhedronAttributeItem,
    setMeshPolyhedraPolyhedronAttributeRange,
    setMeshPolyhedraPolyhedronAttributeColorMap,
    meshPolyhedraPolyhedronAttributeNoDataColor,
    setMeshPolyhedraPolyhedronAttributeNoDataColor,
  };
}
export { useMeshPolyhedraPolyhedronAttributeStyle };
