import type {
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { DataId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface UseMeshPolyhedraVertexAttributeStyleReturn {
  meshPolyhedraVertexAttributeName: (meshId: DataId) => string | undefined;
  meshPolyhedraVertexAttributeItem: (meshId: DataId) => number;
  meshPolyhedraVertexAttributeRange: (meshId: DataId) => [number | undefined, number | undefined];
  meshPolyhedraVertexAttributeTimeStep: (meshId: DataId) => number | undefined;
  setMeshPolyhedraVertexAttributeTimeStep: (meshId: DataId, timeStep: number) => Promise<unknown>;
  meshPolyhedraVertexAttributeColorMap: (meshId: DataId) => string | undefined;
  meshPolyhedraVertexAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshPolyhedraVertexAttribute: (meshId: DataId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshPolyhedraVertexAttributeName: (meshId: DataId, name: string) => Promise<unknown>;
  setMeshPolyhedraVertexAttributeItem: (meshId: DataId, item: number) => Promise<unknown>;
  setMeshPolyhedraVertexAttributeRange: (
    meshId: DataId,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPolyhedraVertexAttributeColorMap: (
    meshId: DataId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPolyhedraVertexAttributeNoDataColor: (meshId: DataId) => RGBAColor;
  setMeshPolyhedraVertexAttributeNoDataColor: (
    meshId: DataId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export type { UseMeshPolyhedraVertexAttributeStyleReturn };
