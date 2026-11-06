import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";
// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  type UseMeshPointsVertexAttributeStyleReturn,
  isMeshPointsVertexAttributeValid,
} from "./vertex_attribute";
import {
  useMeshPointsVertexAttributeConfig,
  useMeshPointsVertexAttributeConfigValues,
  useMeshPointsVertexAttributeConfigWriter,
} from "./vertex_config";
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
  function meshPointsVertexAttributeTimeStep(id: string): number | undefined {
    return attributeTimeStep(id, attributeNamesSchema.$id, meshPointsVertexAttribute(id).name);
  }
  async function setMeshPointsVertexAttribute(
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
    await mutateMeshPointsVertexStyle(id, {
      name,
      item,
    });
    await setMeshPointsVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const schema = meshPointsVertexAttributeSchemas.attribute;
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
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshPointsVertexAttributeValid(attribute)) {
      const result = await setMeshPointsVertexAttribute(id, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshPointsVertexAttributeName(id: string, name: string): Promise<unknown> {
    const item = meshPointsVertexAttributeLastItem(id, name);
    await mutateMeshPointsVertexStyle(id, {
      name,
      item,
    });
    return applyVertexAttribute(id);
  }
  async function setMeshPointsVertexAttributeItem(id: string, item: number): Promise<unknown> {
    await mutateMeshPointsVertexStyle(id, {
      item,
    });
    return applyVertexAttribute(id);
  }
  async function setMeshPointsVertexAttributeTimeStep(
    id: string,
    timeStep: number,
  ): Promise<unknown> {
    const name = meshPointsVertexAttributeName(id);
    if (name === undefined) {
      return undefined;
    }
    await setAttributeTimeStep(id, attributeNamesSchema.$id, name, timeStep);
    return applyVertexAttribute(id);
  }
  async function setMeshPointsVertexAttributeRange(
    id: string,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    await setMeshPointsVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(id);
  }
  async function setMeshPointsVertexAttributeColorMap(
    id: string,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    await setMeshPointsVertexAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyVertexAttribute(id);
  }
  async function setMeshPointsVertexAttributeNoDataColor(
    id: string,
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    const name = meshPointsVertexAttributeName(id);
    const item = meshPointsVertexAttributeItem(id);
    const storedConfig = meshPointsVertexAttributeStoredConfig(id, name, item);
    await setMeshPointsVertexAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(id);
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
export { isMeshPointsVertexAttributeValid } from "./vertex_attribute";
