import type {
  AttributeInput,
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { DataId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

function isMeshCellsVertexAttributeValid(input: AttributeInput): input is ValidAttributeInput {
  return (
    input.name !== undefined &&
    input.item !== undefined &&
    input.minimum !== undefined &&
    input.maximum !== undefined &&
    input.colorMap !== undefined
  );
}

interface UseMeshCellsVertexAttributeStyleReturn {
  meshCellsVertexAttributeName: (meshId: DataId) => string | undefined;
  meshCellsVertexAttributeItem: (meshId: DataId) => number;
  meshCellsVertexAttributeRange: (meshId: DataId) => [number | undefined, number | undefined];
  meshCellsVertexAttributeTimeStep: (meshId: DataId) => number | undefined;
  setMeshCellsVertexAttributeTimeStep: (meshId: DataId, timeStep: number) => Promise<unknown>;
  meshCellsVertexAttributeColorMap: (meshId: DataId) => string | undefined;
  meshCellsVertexAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshCellsVertexAttribute: (meshId: DataId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshCellsVertexAttributeName: (meshId: DataId, name: string) => Promise<unknown>;
  setMeshCellsVertexAttributeItem: (meshId: DataId, item: number) => Promise<unknown>;
  setMeshCellsVertexAttributeRange: (
    meshId: DataId,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshCellsVertexAttributeColorMap: (
    meshId: DataId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshCellsVertexAttributeNoDataColor: (meshId: DataId) => RGBAColor;
  setMeshCellsVertexAttributeNoDataColor: (
    meshId: DataId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export { isMeshCellsVertexAttributeValid };
export type { UseMeshCellsVertexAttributeStyleReturn };
