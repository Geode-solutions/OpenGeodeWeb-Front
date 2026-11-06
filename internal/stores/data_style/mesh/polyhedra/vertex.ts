import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";
// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  type UseMeshPolyhedraVertexAttributeStyleReturn,
  isMeshPolyhedraVertexAttributeValid,
} from "./vertex_attribute";
import {
  useMeshPolyhedraVertexAttributeConfig,
  useMeshPolyhedraVertexAttributeConfigValues,
  useMeshPolyhedraVertexAttributeConfigWriter,
} from "./vertex_config";
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
  function meshPolyhedraVertexAttributeTimeStep(id: string): number | undefined {
    return attributeTimeStep(id, attributeNamesSchema.$id, meshPolyhedraVertexAttribute(id).name);
  }
  async function setMeshPolyhedraVertexAttribute(
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
    await mutateMeshPolyhedraVertexStyle(id, {
      name,
      item,
    });
    await setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const schema = meshPolyhedraVertexAttributeSchemas.attribute;
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
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshPolyhedraVertexAttributeValid(attribute)) {
      const result = await setMeshPolyhedraVertexAttribute(id, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshPolyhedraVertexAttributeName(id: string, name: string): Promise<unknown> {
    const item = meshPolyhedraVertexAttributeLastItem(id, name);
    await mutateMeshPolyhedraVertexStyle(id, {
      name,
      item,
    });
    return applyVertexAttribute(id);
  }
  async function setMeshPolyhedraVertexAttributeItem(id: string, item: number): Promise<unknown> {
    await mutateMeshPolyhedraVertexStyle(id, {
      item,
    });
    return applyVertexAttribute(id);
  }
  async function setMeshPolyhedraVertexAttributeTimeStep(
    id: string,
    timeStep: number,
  ): Promise<unknown> {
    const name = meshPolyhedraVertexAttributeName(id);
    if (name === undefined) {
      return undefined;
    }
    await setAttributeTimeStep(id, attributeNamesSchema.$id, name, timeStep);
    return applyVertexAttribute(id);
  }
  async function setMeshPolyhedraVertexAttributeRange(
    id: string,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    await setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
    return applyVertexAttribute(id);
  }
  async function setMeshPolyhedraVertexAttributeColorMap(
    id: string,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    await setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyVertexAttribute(id);
  }
  async function setMeshPolyhedraVertexAttributeNoDataColor(
    id: string,
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    const name = meshPolyhedraVertexAttributeName(id);
    const item = meshPolyhedraVertexAttributeItem(id);
    const storedConfig = meshPolyhedraVertexAttributeStoredConfig(id, name, item);
    await setMeshPolyhedraVertexAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyVertexAttribute(id);
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
export { isMeshPolyhedraVertexAttributeValid } from "./vertex_attribute";
