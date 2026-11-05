import type {
  AttributeInput,
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { DataId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

function isMeshPolygonsVertexAttributeValid(input: AttributeInput): input is ValidAttributeInput {
  return (
    input.name !== undefined &&
    input.item !== undefined &&
    input.minimum !== undefined &&
    input.maximum !== undefined &&
    input.colorMap !== undefined
  );
}

interface UseMeshPolygonsVertexAttributeStyleReturn {
  meshPolygonsVertexAttributeName: (meshId: DataId) => string | undefined;
  meshPolygonsVertexAttributeItem: (meshId: DataId) => number;
  meshPolygonsVertexAttributeRange: (meshId: DataId) => [number | undefined, number | undefined];
  meshPolygonsVertexAttributeTimeStep: (meshId: DataId) => number | undefined;
  setMeshPolygonsVertexAttributeTimeStep: (meshId: DataId, timeStep: number) => Promise<unknown>;
  meshPolygonsVertexAttributeColorMap: (meshId: DataId) => string | undefined;
  meshPolygonsVertexAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshPolygonsVertexAttribute: (meshId: DataId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshPolygonsVertexAttributeName: (meshId: DataId, name: string) => Promise<unknown>;
  setMeshPolygonsVertexAttributeItem: (meshId: DataId, item: number) => Promise<unknown>;
  setMeshPolygonsVertexAttributeRange: (
    meshId: DataId,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPolygonsVertexAttributeColorMap: (
    meshId: DataId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPolygonsVertexAttributeNoDataColor: (meshId: DataId) => RGBAColor;
  setMeshPolygonsVertexAttributeNoDataColor: (
    meshId: DataId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export { isMeshPolygonsVertexAttributeValid };
export type { UseMeshPolygonsVertexAttributeStyleReturn };
