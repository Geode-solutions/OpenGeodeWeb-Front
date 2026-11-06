import type {
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { AttributeName } from "@ogw_front/types/attribute";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface UseMeshPointsVertexAttributeStyleReturn {
  meshPointsVertexAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshPointsVertexAttributeItem: (meshId: MeshId) => number;
  meshPointsVertexAttributeRange: (meshId: MeshId) => [number | undefined, number | undefined];
  meshPointsVertexAttributeTimeStep: (meshId: MeshId) => number | undefined;
  setMeshPointsVertexAttributeTimeStep: (meshId: MeshId, timeStep: number) => Promise<unknown>;
  meshPointsVertexAttributeColorMap: (meshId: MeshId) => string | undefined;
  meshPointsVertexAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshPointsVertexAttribute: (meshId: MeshId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshPointsVertexAttributeName: (meshId: MeshId, name: AttributeName) => Promise<unknown>;
  setMeshPointsVertexAttributeItem: (meshId: MeshId, item: number) => Promise<unknown>;
  setMeshPointsVertexAttributeRange: (
    meshId: MeshId,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPointsVertexAttributeColorMap: (
    meshId: MeshId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPointsVertexAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
  setMeshPointsVertexAttributeNoDataColor: (
    meshId: MeshId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export type { UseMeshPointsVertexAttributeStyleReturn };
