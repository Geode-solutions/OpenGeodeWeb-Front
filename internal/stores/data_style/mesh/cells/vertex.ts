import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  type UseMeshCellsVertexAttributeStyleReturn,
  type ValidAttributeInput,
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
  function meshCellsVertexAttributeTimeStep(id: string): number | undefined {
    return attributeTimeStep(id, attributeNamesSchema.$id, meshCellsVertexAttribute(id).name);
  }
  async function setMeshCellsVertexAttribute(
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
    await mutateMeshCellsVertexStyle(id, {
      name,
      item,
    });
    await setMeshCellsVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const schema = meshCellsVertexAttributeSchemas.attribute;
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
  async function applyVertexAttribute(id: string): Promise<unknown> {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshCellsVertexAttributeValid(attribute)) {
      const result = await setMeshCellsVertexAttribute(id, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshCellsVertexAttributeName(id: string, name: string): Promise<unknown> {
    const item = meshCellsVertexAttributeLastItem(id, name);
    await mutateMeshCellsVertexStyle(id, {
      name,
      item,
    });
    return applyVertexAttribute(id);
  }
  async function setMeshCellsVertexAttributeItem(id: string, item: number): Promise<unknown> {
    await mutateMeshCellsVertexStyle(id, {
      item,
    });
    return applyVertexAttribute(id);
  }
  async function setMeshCellsVertexAttributeTimeStep(
    id: string,
    timeStep: number,
  ): Promise<unknown> {
    const name = meshCellsVertexAttributeName(id);
    if (name === undefined) {
      return undefined;
    }
    await setAttributeTimeStep(id, attributeNamesSchema.$id, name, timeStep);
    return applyVertexAttribute(id);
  }
  async function setMeshCellsVertexAttributeRange(
    id: string,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    await setMeshCellsVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(id);
  }
  async function setMeshCellsVertexAttributeColorMap(
    id: string,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    await setMeshCellsVertexAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyVertexAttribute(id);
  }
  async function setMeshCellsVertexAttributeNoDataColor(
    id: string,
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    const name = meshCellsVertexAttributeName(id);
    const item = meshCellsVertexAttributeItem(id);
    const storedConfig = meshCellsVertexAttributeStoredConfig(id, name, item);
    await setMeshCellsVertexAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(id);
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
