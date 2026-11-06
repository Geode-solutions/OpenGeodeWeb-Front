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
  useMeshCellsCellAttributeConfig,
  useMeshCellsCellAttributeConfigValues,
  useMeshCellsCellAttributeConfigWriter,
} from "./cell_config";
import type { UseMeshCellsCellAttributeStyleReturn } from "./cell_attribute";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useAttributeTimeStepStyle } from "@ogw_internal/stores/data_style/time_step";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeNamesSchema = back_schemas.opengeodeweb_back.cell_attribute_names;
const meshCellsCellAttributeSchemas = viewer_schemas.opengeodeweb_viewer.mesh.cells.attribute.cell;

// oxlint-disable-next-line max-lines-per-function
function useMeshCellsCellAttributeStyle(): UseMeshCellsCellAttributeStyleReturn {
  const { attributeTimeStep, setAttributeTimeStep, seriesArrayName } = useAttributeTimeStepStyle();
  const viewerStore = useViewerStore();
  const {
    meshCellsCellAttribute,
    meshCellsCellAttributeName,
    meshCellsCellAttributeLastItem,
    meshCellsCellAttributeItem,
    meshCellsCellAttributeStoredConfig,
  } = useMeshCellsCellAttributeConfig();
  const {
    meshCellsCellAttributeRange,
    meshCellsCellAttributeColorMap,
    meshCellsCellAttributeNoDataColor,
  } = useMeshCellsCellAttributeConfigValues();
  const { mutateMeshCellsCellStyle, setMeshCellsCellAttributeStoredConfig } =
    useMeshCellsCellAttributeConfigWriter();
  function meshCellsCellAttributeTimeStep(meshId: MeshId): number | undefined {
    return attributeTimeStep(meshId, attributeNamesSchema.$id, meshCellsCellAttribute(meshId).name);
  }
  async function setMeshCellsCellAttribute(
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
    await mutateMeshCellsCellStyle(meshId, {
      name,
      item,
    });
    await setMeshCellsCellAttributeStoredConfig(meshId, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const schema = meshCellsCellAttributeSchemas.attribute;
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
  async function applyCellAttribute(meshId: MeshId): Promise<unknown> {
    const name = meshCellsCellAttributeName(meshId);
    const item = meshCellsCellAttributeItem(meshId);
    const storedConfig = meshCellsCellAttributeStoredConfig(meshId, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isAttributeValid(attribute)) {
      const result = await setMeshCellsCellAttribute(meshId, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshCellsCellAttributeName(
    meshId: MeshId,
    name: AttributeName,
  ): Promise<unknown> {
    const item = meshCellsCellAttributeLastItem(meshId, name);
    await mutateMeshCellsCellStyle(meshId, {
      name,
      item,
    });
    return applyCellAttribute(meshId);
  }
  async function setMeshCellsCellAttributeItem(
    meshId: MeshId,
    item: AttributeItem,
  ): Promise<unknown> {
    await mutateMeshCellsCellStyle(meshId, {
      item,
    });
    return applyCellAttribute(meshId);
  }
  async function setMeshCellsCellAttributeTimeStep(
    meshId: MeshId,
    timeStep: number,
  ): Promise<unknown> {
    const name = meshCellsCellAttributeName(meshId);
    if (name === undefined) {
      return undefined;
    }
    await setAttributeTimeStep(meshId, attributeNamesSchema.$id, name, timeStep);
    return applyCellAttribute(meshId);
  }
  async function setMeshCellsCellAttributeRange(
    meshId: MeshId,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshCellsCellAttributeName(meshId);
    const item = meshCellsCellAttributeItem(meshId);
    await setMeshCellsCellAttributeStoredConfig(meshId, name, item, {
      minimum,
      maximum,
    });
    return applyCellAttribute(meshId);
  }
  async function setMeshCellsCellAttributeColorMap(
    meshId: MeshId,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshCellsCellAttributeName(meshId);
    const item = meshCellsCellAttributeItem(meshId);
    await setMeshCellsCellAttributeStoredConfig(meshId, name, item, {
      colorMap,
    });
    return applyCellAttribute(meshId);
  }
  async function setMeshCellsCellAttributeNoDataColor(
    meshId: MeshId,
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    const name = meshCellsCellAttributeName(meshId);
    const item = meshCellsCellAttributeItem(meshId);
    const storedConfig = meshCellsCellAttributeStoredConfig(meshId, name, item);
    await setMeshCellsCellAttributeStoredConfig(meshId, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyCellAttribute(meshId);
  }
  return {
    meshCellsCellAttributeName,
    meshCellsCellAttributeTimeStep,
    setMeshCellsCellAttributeTimeStep,
    meshCellsCellAttributeItem,
    meshCellsCellAttributeRange,
    meshCellsCellAttributeColorMap,
    meshCellsCellAttributeStoredConfig,
    setMeshCellsCellAttribute,
    setMeshCellsCellAttributeName,
    setMeshCellsCellAttributeItem,
    setMeshCellsCellAttributeRange,
    setMeshCellsCellAttributeColorMap,
    meshCellsCellAttributeNoDataColor,
    setMeshCellsCellAttributeNoDataColor,
  };
}
export { useMeshCellsCellAttributeStyle };
