import type { AttributeItem, AttributeName, AttributeRange } from "@ogw_front/types/attribute";
import type {
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface UseMeshPolygonsPolygonAttributeStyleReturn {
  meshPolygonsPolygonAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshPolygonsPolygonAttributeItem: (meshId: MeshId) => AttributeItem;
  meshPolygonsPolygonAttributeRange: (meshId: MeshId) => AttributeRange;
  meshPolygonsPolygonAttributeTimeStep: (meshId: MeshId) => number | undefined;
  setMeshPolygonsPolygonAttributeTimeStep: (meshId: MeshId, timeStep: number) => Promise<unknown>;
  meshPolygonsPolygonAttributeColorMap: (meshId: MeshId) => string | undefined;
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
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeColorMap: (
    meshId: MeshId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPolygonsPolygonAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
  setMeshPolygonsPolygonAttributeNoDataColor: (
    meshId: MeshId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export type { UseMeshPolygonsPolygonAttributeStyleReturn };
