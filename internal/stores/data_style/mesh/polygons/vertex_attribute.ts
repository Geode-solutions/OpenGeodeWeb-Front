import type { AttributeItem, AttributeName, AttributeRange } from "@ogw_front/types/attribute";
import type {
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface UseMeshPolygonsVertexAttributeStyleReturn {
  meshPolygonsVertexAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshPolygonsVertexAttributeItem: (meshId: MeshId) => AttributeItem;
  meshPolygonsVertexAttributeRange: (meshId: MeshId) => AttributeRange;
  meshPolygonsVertexAttributeTimeStep: (meshId: MeshId) => number | undefined;
  setMeshPolygonsVertexAttributeTimeStep: (meshId: MeshId, timeStep: number) => Promise<unknown>;
  meshPolygonsVertexAttributeColorMap: (meshId: MeshId) => string | undefined;
  meshPolygonsVertexAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
  setMeshPolygonsVertexAttribute: (meshId: MeshId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshPolygonsVertexAttributeName: (meshId: MeshId, name: AttributeName) => Promise<unknown>;
  setMeshPolygonsVertexAttributeItem: (meshId: MeshId, item: AttributeItem) => Promise<unknown>;
  setMeshPolygonsVertexAttributeRange: (
    meshId: MeshId,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPolygonsVertexAttributeColorMap: (
    meshId: MeshId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPolygonsVertexAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
  setMeshPolygonsVertexAttributeNoDataColor: (
    meshId: MeshId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export type { UseMeshPolygonsVertexAttributeStyleReturn };
