import { DEFAULT_NO_DATA_COLOR, type RGBAColor } from "@ogw_front/utils/default_styles/constants";
import type { ValidAttributeInput } from "@ogw_internal/stores/data_style/attribute_types";
// Third party imports
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import {
  type UseMeshPolyhedraPolyhedronAttributeStyleReturn,
  isMeshPolyhedraPolyhedronAttributeValid,
} from "./polyhedron_attribute";
import {
  useMeshPolyhedraPolyhedronAttributeConfig,
  useMeshPolyhedraPolyhedronAttributeConfigValues,
  useMeshPolyhedraPolyhedronAttributeConfigWriter,
} from "./polyhedron_config";
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
  function meshPolyhedraPolyhedronAttributeTimeStep(id: string): number | undefined {
    return attributeTimeStep(
      id,
      attributeNamesSchema.$id,
      meshPolyhedraPolyhedronAttribute(id).name,
    );
  }
  async function setMeshPolyhedraPolyhedronAttribute(
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
    await mutateMeshPolyhedraPolyhedronStyle(id, {
      name,
      item,
    });
    await setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
      colorMap,
      no_data_color,
    });
    const points = [...getRGBPointsFromPreset(colorMap)];
    const schema = meshPolyhedraPolyhedronAttributeSchemas.attribute;
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
  async function applyPolyhedronAttribute(id: string): Promise<unknown> {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    const attribute = {
      name,
      item,
      minimum: storedConfig.minimum,
      maximum: storedConfig.maximum,
      colorMap: storedConfig.colorMap,
      no_data_color: storedConfig.no_data_color,
    };
    if (isMeshPolyhedraPolyhedronAttributeValid(attribute)) {
      const result = await setMeshPolyhedraPolyhedronAttribute(id, attribute);
      return result;
    }
    return undefined;
  }
  async function setMeshPolyhedraPolyhedronAttributeName(
    id: string,
    name: string,
  ): Promise<unknown> {
    const item = meshPolyhedraPolyhedronAttributeLastItem(id, name);
    await mutateMeshPolyhedraPolyhedronStyle(id, {
      name,
      item,
    });
    return applyPolyhedronAttribute(id);
  }
  async function setMeshPolyhedraPolyhedronAttributeItem(
    id: string,
    item: number,
  ): Promise<unknown> {
    await mutateMeshPolyhedraPolyhedronStyle(id, {
      item,
    });
    return applyPolyhedronAttribute(id);
  }
  async function setMeshPolyhedraPolyhedronAttributeTimeStep(
    id: string,
    timeStep: number,
  ): Promise<unknown> {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    if (name === undefined) {
      return undefined;
    }
    await setAttributeTimeStep(id, attributeNamesSchema.$id, name, timeStep);
    return applyPolyhedronAttribute(id);
  }
  async function setMeshPolyhedraPolyhedronAttributeRange(
    id: string,
    minimum: number,
    maximum: number,
  ): Promise<unknown> {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    await setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, {
      minimum,
      maximum,
    });
    return applyPolyhedronAttribute(id);
  }
  async function setMeshPolyhedraPolyhedronAttributeColorMap(
    id: string,
    colorMap: string | undefined,
  ): Promise<unknown> {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    await setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, {
      colorMap,
    });
    return applyPolyhedronAttribute(id);
  }
  async function setMeshPolyhedraPolyhedronAttributeNoDataColor(
    id: string,
    no_data_color: RGBAColor,
  ): Promise<unknown> {
    const name = meshPolyhedraPolyhedronAttributeName(id);
    const item = meshPolyhedraPolyhedronAttributeItem(id);
    const storedConfig = meshPolyhedraPolyhedronAttributeStoredConfig(id, name, item);
    await setMeshPolyhedraPolyhedronAttributeStoredConfig(id, name, item, {
      ...storedConfig,
      no_data_color,
    });
    return applyPolyhedronAttribute(id);
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
export { isMeshPolyhedraPolyhedronAttributeValid } from "./polyhedron_attribute";
