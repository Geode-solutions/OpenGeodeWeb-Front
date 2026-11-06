import type { AttributeItem, AttributeName, AttributeRange } from "@ogw_front/types/attribute";
import type {
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface UseMeshEdgesVertexAttributeStyleReturn {
  meshEdgesVertexAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshEdgesVertexAttributeItem: (meshId: MeshId) => AttributeItem;
  meshEdgesVertexAttributeRange: (meshId: MeshId) => AttributeRange;
  meshEdgesVertexAttributeTimeStep: (meshId: MeshId) => number | undefined;
  setMeshEdgesVertexAttributeTimeStep: (meshId: MeshId, timeStep: number) => Promise<unknown>;
  meshEdgesVertexAttributeColorMap: (meshId: MeshId) => string | undefined;
  meshEdgesVertexAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
  setMeshEdgesVertexAttribute: (meshId: MeshId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshEdgesVertexAttributeName: (meshId: MeshId, name: AttributeName) => Promise<unknown>;
  setMeshEdgesVertexAttributeItem: (meshId: MeshId, item: AttributeItem) => Promise<unknown>;
  setMeshEdgesVertexAttributeRange: (
    meshId: MeshId,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshEdgesVertexAttributeColorMap: (
    meshId: MeshId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshEdgesVertexAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
  setMeshEdgesVertexAttributeNoDataColor: (
    meshId: MeshId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export type { UseMeshEdgesVertexAttributeStyleReturn };
