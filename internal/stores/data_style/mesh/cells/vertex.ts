import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { DataId } from "@ogw_front/types/identifiers";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";
// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  type UseMeshCellsVertexAttributeStyleReturn,
  isMeshCellsVertexAttributeValid,
} from "./vertex_attribute";
import {
  useMeshCellsVertexAttributeConfig,
  useMeshCellsVertexAttributeConfigValues,
  useMeshCellsVertexAttributeConfigWriter,
} from "./vertex_config";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useAttributeTimeStepStyle } from "@ogw_internal/stores/data_style/time_step";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeNamesSchema = back_schemas.opengeodeweb_back.vertex_attribute_names;
const meshCellsVertexAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.cells.attribute.vertex;

// oxlint-disable-next-line max-lines-per-function
function useMeshCellsVertexAttributeStyle(): UseMeshCellsVertexAttributeStyleReturn {
  const { attributeTimeStep, setAttributeTimeStep, seriesArrayName } = useAttributeTimeStepStyle();
  const viewerStore = useViewerStore();
  const {
    meshCellsVertexAttribute,
    meshCellsVertexAttributeName,
    meshCellsVertexAttributeLastItem,
    meshCellsVertexAttributeItem,
    meshCellsVertexAttributeStoredConfig,
  } = useMeshCellsVertexAttributeConfig();
  const {
    meshCellsVertexAttributeRange,
    meshCellsVertexAttributeColorMap,
    meshCellsVertexAttributeNoDataColor,
  } = useMeshCellsVertexAttributeConfigValues();
  const { mutateMeshCellsVertexStyle, setMeshCellsVertexAttributeStoredConfig } =
    useMeshCellsVertexAttributeConfigWriter();
  function meshCellsVertexAttributeTimeStep(meshId: DataId): number | undefined {
    return attributeTimeStep(
      meshId,
      attributeNamesSchema.$id,
      meshCellsVertexAttribute(meshId).name,
    );
  }
  async function setMeshCellsVertexAttribute(
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
    await mutateMeshCellsVertexStyle(meshId, {
      name,
      item,
    });
    await setMeshCellsVertexAttributeStoredConfig(meshId, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const schema = meshCellsVertexAttributeSchemas.attribute;
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
    const name = meshCellsVertexAttributeName(meshId);
    const item = meshCellsVertexAttributeItem(meshId);
    const storedConfig = meshCellsVertexAttributeStoredConfig(meshId, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshCellsVertexAttributeValid(attribute)) {
      const result = await setMeshCellsVertexAttribute(meshId, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshCellsVertexAttributeName(meshId: DataId, name: string): Promise<unknown> {
    const item = meshCellsVertexAttributeLastItem(meshId, name);
    await mutateMeshCellsVertexStyle(meshId, {
      name,
      item,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshCellsVertexAttributeItem(meshId: DataId, item: number): Promise<unknown> {
    await mutateMeshCellsVertexStyle(meshId, {
      item,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshCellsVertexAttributeTimeStep(
    meshId: DataId,
    timeStep: number,
  ): Promise<unknown> {
    const name = meshCellsVertexAttributeName(meshId);
    if (name === undefined) {
      return undefined;
    }
    await setAttributeTimeStep(meshId, attributeNamesSchema.$id, name, timeStep);
    return applyVertexAttribute(meshId);
  }
  async function setMeshCellsVertexAttributeRange(
    meshId: DataId,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshCellsVertexAttributeName(meshId);
    const item = meshCellsVertexAttributeItem(meshId);
    await setMeshCellsVertexAttributeStoredConfig(meshId, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshCellsVertexAttributeColorMap(
    meshId: DataId,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshCellsVertexAttributeName(meshId);
    const item = meshCellsVertexAttributeItem(meshId);
    await setMeshCellsVertexAttributeStoredConfig(meshId, name, item, {
      colorMap,
    });
    return applyVertexAttribute(meshId);
  }
  async function setMeshCellsVertexAttributeNoDataColor(
    meshId: DataId,
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    const name = meshCellsVertexAttributeName(meshId);
    const item = meshCellsVertexAttributeItem(meshId);
    const storedConfig = meshCellsVertexAttributeStoredConfig(meshId, name, item);
    await setMeshCellsVertexAttributeStoredConfig(meshId, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(meshId);
  }
  return {
    meshCellsVertexAttributeName,
    meshCellsVertexAttributeTimeStep,
    setMeshCellsVertexAttributeTimeStep,
    meshCellsVertexAttributeItem,
    meshCellsVertexAttributeRange,
    meshCellsVertexAttributeColorMap,
    meshCellsVertexAttributeStoredConfig,
    setMeshCellsVertexAttribute,
    setMeshCellsVertexAttributeName,
    setMeshCellsVertexAttributeItem,
    setMeshCellsVertexAttributeRange,
    setMeshCellsVertexAttributeColorMap,
    meshCellsVertexAttributeNoDataColor,
    setMeshCellsVertexAttributeNoDataColor,
  };
}
export { useMeshCellsVertexAttributeStyle };
export { isMeshCellsVertexAttributeValid } from "./vertex_attribute";
