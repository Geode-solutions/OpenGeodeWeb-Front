import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";
// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  type UseMeshCellsCellAttributeStyleReturn,
  isMeshCellsCellAttributeValid,
} from "./cell_attribute";
import {
  useMeshCellsCellAttributeConfig,
  useMeshCellsCellAttributeConfigValues,
  useMeshCellsCellAttributeConfigWriter,
} from "./cell_config";
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
  function meshCellsCellAttributeTimeStep(id: string): number | undefined {
    return attributeTimeStep(id, attributeNamesSchema.$id, meshCellsCellAttribute(id).name);
  }
  async function setMeshCellsCellAttribute(
    id: string,
    {
      name,
      item,
      minimum,
      maximum,
      colorMap,
      no_data_color = DEFAULT_NO_DATA_COLOR,
    }: ValidAttributeInput,
  ): Promise<unknown> {
    await mutateMeshCellsCellStyle(id, {
      name,
      item,
    });
    await setMeshCellsCellAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const schema = meshCellsCellAttributeSchemas.attribute;
    const params = {
      id,
      name: seriesArrayName(id, attributeNamesSchema.$id, name),
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
  async function applyCellAttribute(id: string): Promise<unknown> {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshCellsCellAttributeValid(attribute)) {
      const result = await setMeshCellsCellAttribute(id, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshCellsCellAttributeName(id: string, name: string): Promise<unknown> {
    const item = meshCellsCellAttributeLastItem(id, name);
    await mutateMeshCellsCellStyle(id, {
      name,
      item,
    });
    return applyCellAttribute(id);
  }
  async function setMeshCellsCellAttributeItem(id: string, item: number): Promise<unknown> {
    await mutateMeshCellsCellStyle(id, {
      item,
    });
    return applyCellAttribute(id);
  }
  async function setMeshCellsCellAttributeTimeStep(id: string, timeStep: number): Promise<unknown> {
    const name = meshCellsCellAttributeName(id);
    if (name === undefined) {
      return undefined;
    }
    await setAttributeTimeStep(id, attributeNamesSchema.$id, name, timeStep);
    return applyCellAttribute(id);
  }
  async function setMeshCellsCellAttributeRange(
    id: string,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    await setMeshCellsCellAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
    return applyCellAttribute(id);
  }
  async function setMeshCellsCellAttributeColorMap(
    id: string,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    await setMeshCellsCellAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyCellAttribute(id);
  }
  async function setMeshCellsCellAttributeNoDataColor(
    id: string,
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    const name = meshCellsCellAttributeName(id);
    const item = meshCellsCellAttributeItem(id);
    const storedConfig = meshCellsCellAttributeStoredConfig(id, name, item);
    await setMeshCellsCellAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyCellAttribute(id);
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
export { isMeshCellsCellAttributeValid } from "./cell_attribute";
