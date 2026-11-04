import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  type UseMeshEdgesEdgeAttributeStyleReturn,
  type ValidAttributeInput,
  isMeshEdgesEdgeAttributeValid,
} from "./edge_attribute";
import {
  useMeshEdgesEdgeAttributeConfig,
  useMeshEdgesEdgeAttributeConfigValues,
  useMeshEdgesEdgeAttributeConfigWriter,
} from "./edge_config";
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
  function meshEdgesEdgeAttributeTimeStep(id: string): number | undefined {
    return attributeTimeStep(id, attributeNamesSchema.$id, meshEdgesEdgeAttribute(id).name);
  }
  async function setMeshEdgesEdgeAttribute(
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
    await mutateMeshEdgesEdgeStyle(id, {
      name,
      item,
    });
    await setMeshEdgesEdgeAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const schema = meshEdgesEdgeAttributeSchemas.attribute;
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
  async function applyEdgeAttribute(id: string): Promise<unknown> {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshEdgesEdgeAttributeValid(attribute)) {
      const result = await setMeshEdgesEdgeAttribute(id, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshEdgesEdgeAttributeName(id: string, name: string): Promise<unknown> {
    const item = meshEdgesEdgeAttributeLastItem(id, name);
    await mutateMeshEdgesEdgeStyle(id, {
      name,
      item,
    });
    return applyEdgeAttribute(id);
  }
  async function setMeshEdgesEdgeAttributeItem(id: string, item: number): Promise<unknown> {
    await mutateMeshEdgesEdgeStyle(id, {
      item,
    });
    return applyEdgeAttribute(id);
  }
  async function setMeshEdgesEdgeAttributeTimeStep(id: string, timeStep: number): Promise<unknown> {
    const name = meshEdgesEdgeAttributeName(id);
    if (name === undefined) {
      return undefined;
    }
    await setAttributeTimeStep(id, attributeNamesSchema.$id, name, timeStep);
    return applyEdgeAttribute(id);
  }
  async function setMeshEdgesEdgeAttributeRange(
    id: string,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    await setMeshEdgesEdgeAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
    return applyEdgeAttribute(id);
  }
  async function setMeshEdgesEdgeAttributeColorMap(
    id: string,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    await setMeshEdgesEdgeAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyEdgeAttribute(id);
  }
  async function setMeshEdgesEdgeAttributeNoDataColor(
    id: string,
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    const name = meshEdgesEdgeAttributeName(id);
    const item = meshEdgesEdgeAttributeItem(id);
    const storedConfig = meshEdgesEdgeAttributeStoredConfig(id, name, item);
    await setMeshEdgesEdgeAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyEdgeAttribute(id);
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
export { isMeshEdgesEdgeAttributeValid } from "./edge_attribute";
