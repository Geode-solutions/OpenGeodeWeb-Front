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

function isMeshPointsVertexAttributeValid(input: AttributeInput): input is ValidAttributeInput {
  return (
    input.name !== undefined &&
    input.item !== undefined &&
    input.minimum !== undefined &&
    input.maximum !== undefined &&
    input.colorMap !== undefined
  );
}

interface UseMeshPointsVertexAttributeStyleReturn {
  meshPointsVertexAttributeName: (meshId: DataId) => string | undefined;
  meshPointsVertexAttributeItem: (meshId: DataId) => number;
  meshPointsVertexAttributeRange: (meshId: DataId) => [number | undefined, number | undefined];
  meshPointsVertexAttributeTimeStep: (meshId: DataId) => number | undefined;
  setMeshPointsVertexAttributeTimeStep: (meshId: DataId, timeStep: number) => Promise<unknown>;
  meshPointsVertexAttributeColorMap: (meshId: DataId) => string | undefined;
  meshPointsVertexAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshPointsVertexAttribute: (meshId: DataId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshPointsVertexAttributeName: (meshId: DataId, name: string) => Promise<unknown>;
  setMeshPointsVertexAttributeItem: (meshId: DataId, item: number) => Promise<unknown>;
  setMeshPointsVertexAttributeRange: (
    meshId: DataId,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPointsVertexAttributeColorMap: (
    meshId: DataId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPointsVertexAttributeNoDataColor: (meshId: DataId) => RGBAColor;
  setMeshPointsVertexAttributeNoDataColor: (
    meshId: DataId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export { isMeshPointsVertexAttributeValid };
export type {
  AttributeStoredConfig,
  AttributeState,
  ValidAttributeInput,
  UseMeshPointsVertexAttributeStyleReturn,
};
