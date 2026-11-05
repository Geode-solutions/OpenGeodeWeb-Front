import type { DataId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface AttributeStoredConfig {
  minimum: number | undefined;
  maximum: number | undefined;
  colorMap: string | undefined;
  no_data_color: RGBAColor;
}

interface AttributeState {
  name?: string;
  item?: number;
  storedConfigs?: Record<string, { lastItem: number } & Record<string, AttributeStoredConfig>>;
}

interface AttributeInput {
  name: string | undefined;
  item: number | undefined;
  minimum: number | undefined;
  maximum: number | undefined;
  colorMap: string | undefined;
  no_data_color?: RGBAColor;
}

interface ValidAttributeInput {
  name: string;
  item: number;
  minimum: number;
  maximum: number;
  colorMap: string;
  no_data_color?: RGBAColor;
}

function isMeshPolyhedraVertexAttributeValid(input: AttributeInput): input is ValidAttributeInput {
  return (
    input.name !== undefined &&
    input.item !== undefined &&
    input.minimum !== undefined &&
    input.maximum !== undefined &&
    input.colorMap !== undefined
  );
}

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
export { isMeshPolyhedraVertexAttributeValid };
export type {
  AttributeStoredConfig,
  AttributeState,
  ValidAttributeInput,
  UseMeshPolyhedraVertexAttributeStyleReturn,
};
