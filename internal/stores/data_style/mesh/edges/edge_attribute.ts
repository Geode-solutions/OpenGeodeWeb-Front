import type { AttributeItem, AttributeName } from "@ogw_front/types/attribute";
import type {
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface UseMeshEdgesEdgeAttributeStyleReturn {
  meshEdgesEdgeAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshEdgesEdgeAttributeItem: (meshId: MeshId) => AttributeItem;
  meshEdgesEdgeAttributeRange: (meshId: MeshId) => [number | undefined, number | undefined];
  meshEdgesEdgeAttributeTimeStep: (meshId: MeshId) => number | undefined;
  setMeshEdgesEdgeAttributeTimeStep: (meshId: MeshId, timeStep: number) => Promise<unknown>;
  meshEdgesEdgeAttributeColorMap: (meshId: MeshId) => string | undefined;
  meshEdgesEdgeAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
  setMeshEdgesEdgeAttribute: (meshId: MeshId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshEdgesEdgeAttributeName: (meshId: MeshId, name: AttributeName) => Promise<unknown>;
  setMeshEdgesEdgeAttributeItem: (meshId: MeshId, item: AttributeItem) => Promise<unknown>;
  setMeshEdgesEdgeAttributeRange: (
    meshId: MeshId,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshEdgesEdgeAttributeColorMap: (
    meshId: MeshId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshEdgesEdgeAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
  setMeshEdgesEdgeAttributeNoDataColor: (
    meshId: MeshId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export type { UseMeshEdgesEdgeAttributeStyleReturn };
