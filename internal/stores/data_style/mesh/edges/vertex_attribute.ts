import type {
  AttributeInput,
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { DataId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

function isMeshEdgesVertexAttributeValid(input: AttributeInput): input is ValidAttributeInput {
  return (
    input.name !== undefined &&
    input.item !== undefined &&
    input.minimum !== undefined &&
    input.maximum !== undefined &&
    input.colorMap !== undefined
  );
}

interface UseMeshEdgesVertexAttributeStyleReturn {
  meshEdgesVertexAttributeName: (meshId: DataId) => string | undefined;
  meshEdgesVertexAttributeItem: (meshId: DataId) => number;
  meshEdgesVertexAttributeRange: (meshId: DataId) => [number | undefined, number | undefined];
  meshEdgesVertexAttributeTimeStep: (meshId: DataId) => number | undefined;
  setMeshEdgesVertexAttributeTimeStep: (meshId: DataId, timeStep: number) => Promise<unknown>;
  meshEdgesVertexAttributeColorMap: (meshId: DataId) => string | undefined;
  meshEdgesVertexAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshEdgesVertexAttribute: (meshId: DataId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshEdgesVertexAttributeName: (meshId: DataId, name: string) => Promise<unknown>;
  setMeshEdgesVertexAttributeItem: (meshId: DataId, item: number) => Promise<unknown>;
  setMeshEdgesVertexAttributeRange: (
    meshId: DataId,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshEdgesVertexAttributeColorMap: (
    meshId: DataId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshEdgesVertexAttributeNoDataColor: (meshId: DataId) => RGBAColor;
  setMeshEdgesVertexAttributeNoDataColor: (
    meshId: DataId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export { isMeshEdgesVertexAttributeValid };
export type { UseMeshEdgesVertexAttributeStyleReturn };
