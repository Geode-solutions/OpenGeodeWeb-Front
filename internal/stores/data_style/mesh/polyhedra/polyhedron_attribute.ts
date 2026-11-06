import type { AttributeItem, AttributeName, AttributeRange } from "@ogw_front/types/attribute";
import type {
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface UseMeshPolyhedraPolyhedronAttributeStyleReturn {
  meshPolyhedraPolyhedronAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshPolyhedraPolyhedronAttributeItem: (meshId: MeshId) => AttributeItem;
  meshPolyhedraPolyhedronAttributeRange: (meshId: MeshId) => AttributeRange;
  meshPolyhedraPolyhedronAttributeTimeStep: (meshId: MeshId) => number | undefined;
  setMeshPolyhedraPolyhedronAttributeTimeStep: (
    meshId: MeshId,
    timeStep: number,
  ) => Promise<unknown>;
  meshPolyhedraPolyhedronAttributeColorMap: (meshId: MeshId) => string | undefined;
  meshPolyhedraPolyhedronAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
  setMeshPolyhedraPolyhedronAttribute: (
    meshId: MeshId,
    input: ValidAttributeInput,
  ) => Promise<unknown>;
  setMeshPolyhedraPolyhedronAttributeName: (
    meshId: MeshId,
    name: AttributeName,
  ) => Promise<unknown>;
  setMeshPolyhedraPolyhedronAttributeItem: (
    meshId: MeshId,
    item: AttributeItem,
  ) => Promise<unknown>;
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
