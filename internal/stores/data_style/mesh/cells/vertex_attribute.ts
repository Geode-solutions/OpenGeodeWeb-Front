import type { AttributeItem, AttributeName } from "@ogw_front/types/attribute";
import type {
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface UseMeshCellsVertexAttributeStyleReturn {
  meshCellsVertexAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshCellsVertexAttributeItem: (meshId: MeshId) => AttributeItem;
  meshCellsVertexAttributeRange: (meshId: MeshId) => [number | undefined, number | undefined];
  meshCellsVertexAttributeTimeStep: (meshId: MeshId) => number | undefined;
  setMeshCellsVertexAttributeTimeStep: (meshId: MeshId, timeStep: number) => Promise<unknown>;
  meshCellsVertexAttributeColorMap: (meshId: MeshId) => string | undefined;
  meshCellsVertexAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
  setMeshCellsVertexAttribute: (meshId: MeshId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshCellsVertexAttributeName: (meshId: MeshId, name: AttributeName) => Promise<unknown>;
  setMeshCellsVertexAttributeItem: (meshId: MeshId, item: AttributeItem) => Promise<unknown>;
  setMeshCellsVertexAttributeRange: (
    meshId: MeshId,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshCellsVertexAttributeColorMap: (
    meshId: MeshId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshCellsVertexAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
  setMeshCellsVertexAttributeNoDataColor: (
    meshId: MeshId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export type { UseMeshCellsVertexAttributeStyleReturn };
