import type {
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface UseMeshPolyhedraPolyhedronAttributeStyleReturn {
  meshPolyhedraPolyhedronAttributeName: (meshId: MeshId) => string | undefined;
  meshPolyhedraPolyhedronAttributeItem: (meshId: MeshId) => number;
  meshPolyhedraPolyhedronAttributeRange: (
    meshId: MeshId,
  ) => [number | undefined, number | undefined];
  meshPolyhedraPolyhedronAttributeTimeStep: (meshId: MeshId) => number | undefined;
  setMeshPolyhedraPolyhedronAttributeTimeStep: (
    meshId: MeshId,
    timeStep: number,
  ) => Promise<unknown>;
  meshPolyhedraPolyhedronAttributeColorMap: (meshId: MeshId) => string | undefined;
  meshPolyhedraPolyhedronAttributeStoredConfig: (
    meshId: MeshId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshPolyhedraPolyhedronAttribute: (
    meshId: MeshId,
    input: ValidAttributeInput,
  ) => Promise<unknown>;
  setMeshPolyhedraPolyhedronAttributeName: (meshId: MeshId, name: string) => Promise<unknown>;
  setMeshPolyhedraPolyhedronAttributeItem: (meshId: MeshId, item: number) => Promise<unknown>;
  setMeshPolyhedraPolyhedronAttributeRange: (
    meshId: MeshId,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPolyhedraPolyhedronAttributeColorMap: (
    meshId: MeshId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPolyhedraPolyhedronAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
  setMeshPolyhedraPolyhedronAttributeNoDataColor: (
    meshId: MeshId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export type { UseMeshPolyhedraPolyhedronAttributeStyleReturn };
