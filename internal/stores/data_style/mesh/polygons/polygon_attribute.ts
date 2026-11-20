import type {
  AttributeColorMap,
  AttributeRange,
  AttributeTimeStep,
} from "@ogw_front/types/attribute";
import type {
  AttributeItem,
  AttributeName,
  AttributeRangeMaximum,
  AttributeRangeMinimum,
  ColorRGBA,
} from "@geode/opengeodeweb-viewer/schema_types";
import type {
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";

interface UseMeshPolygonsPolygonAttributeStyleReturn {
  meshPolygonsPolygonAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshPolygonsPolygonAttributeItem: (meshId: MeshId) => AttributeItem;
  meshPolygonsPolygonAttributeRange: (meshId: MeshId) => AttributeRange;
  meshPolygonsPolygonAttributeTimeStep: (meshId: MeshId) => AttributeTimeStep | undefined;
  setMeshPolygonsPolygonAttributeTimeStep: (
    meshId: MeshId,
    timeStep: AttributeTimeStep,
  ) => Promise<unknown>;
  meshPolygonsPolygonAttributeColorMap: (meshId: MeshId) => AttributeColorMap | undefined;
  meshPolygonsPolygonAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
  setMeshPolygonsPolygonAttribute: (meshId: MeshId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeName: (meshId: MeshId, name: AttributeName) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeItem: (meshId: MeshId, item: AttributeItem) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeRange: (
    meshId: MeshId,
    minimum: AttributeRangeMinimum,
    maximum: AttributeRangeMaximum,
  ) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeColorMap: (
    meshId: MeshId,
    colorMap: AttributeColorMap | undefined,
  ) => Promise<unknown>;
  meshPolygonsPolygonAttributeNoDataColor: (meshId: MeshId) => ColorRGBA;
  setMeshPolygonsPolygonAttributeNoDataColor: (
    meshId: MeshId,
    no_data_color: ColorRGBA,
  ) => Promise<unknown>;
}
export type { UseMeshPolygonsPolygonAttributeStyleReturn };
