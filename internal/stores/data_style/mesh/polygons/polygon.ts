import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  type UseMeshPolygonsPolygonAttributeStyleReturn,
  type ValidAttributeInput,
  isMeshPolygonsPolygonAttributeValid,
} from "./polygon_attribute";
import {
  useMeshPolygonsPolygonAttributeConfig,
  useMeshPolygonsPolygonAttributeConfigValues,
  useMeshPolygonsPolygonAttributeConfigWriter,
} from "./polygon_config";
import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap";
import { useAttributeTimeStepStyle } from "@ogw_internal/stores/data_style/time_step";
import { useViewerStore } from "@ogw_front/stores/viewer";

// Local constants
const attributeNamesSchema = back_schemas.opengeodeweb_back.polygon_attribute_names;
const meshPolygonsPolygonAttributeSchemas =
  viewer_schemas.opengeodeweb_viewer.mesh.polygons.attribute.polygon;

// oxlint-disable-next-line max-lines-per-function
function useMeshPolygonsPolygonAttributeStyle(): UseMeshPolygonsPolygonAttributeStyleReturn {
  const { attributeTimeStep, setAttributeTimeStep, seriesArrayName } = useAttributeTimeStepStyle();
  const viewerStore = useViewerStore();
  const {
    meshPolygonsPolygonAttribute,
    meshPolygonsPolygonAttributeName,
    meshPolygonsPolygonAttributeLastItem,
    meshPolygonsPolygonAttributeItem,
    meshPolygonsPolygonAttributeStoredConfig,
  } = useMeshPolygonsPolygonAttributeConfig();
  const {
    meshPolygonsPolygonAttributeRange,
    meshPolygonsPolygonAttributeColorMap,
    meshPolygonsPolygonAttributeNoDataColor,
  } = useMeshPolygonsPolygonAttributeConfigValues();
  const { mutateMeshPolygonsPolygonStyle, setMeshPolygonsPolygonAttributeStoredConfig } =
    useMeshPolygonsPolygonAttributeConfigWriter();
  function meshPolygonsPolygonAttributeTimeStep(id: string): number | undefined {
    return attributeTimeStep(id, attributeNamesSchema.$id, meshPolygonsPolygonAttribute(id).name);
  }
  async function setMeshPolygonsPolygonAttribute(
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
    await mutateMeshPolygonsPolygonStyle(id, {
      name,
      item,
    });
    await setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const schema = meshPolygonsPolygonAttributeSchemas.attribute;
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
  async function applyPolygonAttribute(id: string): Promise<unknown> {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshPolygonsPolygonAttributeValid(attribute)) {
      const result = await setMeshPolygonsPolygonAttribute(id, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshPolygonsPolygonAttributeName(id: string, name: string): Promise<unknown> {
    const item = meshPolygonsPolygonAttributeLastItem(id, name);
    await mutateMeshPolygonsPolygonStyle(id, {
      name,
      item,
    });
    return applyPolygonAttribute(id);
  }
  async function setMeshPolygonsPolygonAttributeItem(id: string, item: number): Promise<unknown> {
    await mutateMeshPolygonsPolygonStyle(id, {
      item,
    });
    return applyPolygonAttribute(id);
  }
  async function setMeshPolygonsPolygonAttributeTimeStep(
    id: string,
    timeStep: number,
  ): Promise<unknown> {
    const name = meshPolygonsPolygonAttributeName(id);
    if (name === undefined) {
      return undefined;
    }
    await setAttributeTimeStep(id, attributeNamesSchema.$id, name, timeStep);
    return applyPolygonAttribute(id);
  }
  async function setMeshPolygonsPolygonAttributeRange(
    id: string,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    await setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
    return applyPolygonAttribute(id);
  }
  async function setMeshPolygonsPolygonAttributeColorMap(
    id: string,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    await setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyPolygonAttribute(id);
  }
  async function setMeshPolygonsPolygonAttributeNoDataColor(
    id: string,
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    const name = meshPolygonsPolygonAttributeName(id);
    const item = meshPolygonsPolygonAttributeItem(id);
    const storedConfig = meshPolygonsPolygonAttributeStoredConfig(id, name, item);
    await setMeshPolygonsPolygonAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyPolygonAttribute(id);
  }
  return {
    meshPolygonsPolygonAttributeName,
    meshPolygonsPolygonAttributeTimeStep,
    setMeshPolygonsPolygonAttributeTimeStep,
    meshPolygonsPolygonAttributeItem,
    meshPolygonsPolygonAttributeRange,
    meshPolygonsPolygonAttributeColorMap,
    meshPolygonsPolygonAttributeStoredConfig,
    setMeshPolygonsPolygonAttribute,
    setMeshPolygonsPolygonAttributeName,
    setMeshPolygonsPolygonAttributeItem,
    setMeshPolygonsPolygonAttributeRange,
    setMeshPolygonsPolygonAttributeColorMap,
    meshPolygonsPolygonAttributeNoDataColor,
    setMeshPolygonsPolygonAttributeNoDataColor,
  };
}
export { useMeshPolygonsPolygonAttributeStyle };
export { isMeshPolygonsPolygonAttributeValid } from "./polygon_attribute";
