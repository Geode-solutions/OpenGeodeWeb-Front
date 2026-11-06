import type { AttributeItem, AttributeName } from "@ogw_front/types/attribute";
import type {
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface UseMeshPolyhedraVertexAttributeStyleReturn {
  meshPolyhedraVertexAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshPolyhedraVertexAttributeItem: (meshId: MeshId) => AttributeItem;
  meshPolyhedraVertexAttributeRange: (meshId: MeshId) => [number | undefined, number | undefined];
  meshPolyhedraVertexAttributeTimeStep: (meshId: MeshId) => number | undefined;
  setMeshPolyhedraVertexAttributeTimeStep: (meshId: MeshId, timeStep: number) => Promise<unknown>;
  meshPolyhedraVertexAttributeColorMap: (meshId: MeshId) => string | undefined;
  meshPolyhedraVertexAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
  setMeshPolyhedraVertexAttribute: (meshId: MeshId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshPolyhedraVertexAttributeName: (meshId: MeshId, name: AttributeName) => Promise<unknown>;
  setMeshPolyhedraVertexAttributeItem: (meshId: MeshId, item: AttributeItem) => Promise<unknown>;
  setMeshPolyhedraVertexAttributeRange: (
    meshId: MeshId,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPolyhedraVertexAttributeColorMap: (
    meshId: MeshId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPolyhedraVertexAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
  setMeshPolyhedraVertexAttributeNoDataColor: (
    meshId: MeshId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export type { UseMeshPolyhedraVertexAttributeStyleReturn };
