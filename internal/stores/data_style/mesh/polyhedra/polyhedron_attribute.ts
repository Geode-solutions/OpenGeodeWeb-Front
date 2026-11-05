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

function isMeshPolyhedraPolyhedronAttributeValid(
  input: AttributeInput,
): input is ValidAttributeInput {
  return (
    input.name !== undefined &&
    input.item !== undefined &&
    input.minimum !== undefined &&
    input.maximum !== undefined &&
    input.colorMap !== undefined
  );
}

interface UseMeshPolyhedraPolyhedronAttributeStyleReturn {
  meshPolyhedraPolyhedronAttributeName: (meshId: DataId) => string | undefined;
  meshPolyhedraPolyhedronAttributeItem: (meshId: DataId) => number;
  meshPolyhedraPolyhedronAttributeRange: (
    meshId: DataId,
  ) => [number | undefined, number | undefined];
  meshPolyhedraPolyhedronAttributeTimeStep: (meshId: DataId) => number | undefined;
  setMeshPolyhedraPolyhedronAttributeTimeStep: (
    meshId: DataId,
    timeStep: number,
  ) => Promise<unknown>;
  meshPolyhedraPolyhedronAttributeColorMap: (meshId: DataId) => string | undefined;
  meshPolyhedraPolyhedronAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshPolyhedraPolyhedronAttribute: (
    meshId: DataId,
    input: ValidAttributeInput,
  ) => Promise<unknown>;
  setMeshPolyhedraPolyhedronAttributeName: (meshId: DataId, name: string) => Promise<unknown>;
  setMeshPolyhedraPolyhedronAttributeItem: (meshId: DataId, item: number) => Promise<unknown>;
  setMeshPolyhedraPolyhedronAttributeRange: (
    meshId: DataId,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPolyhedraPolyhedronAttributeColorMap: (
    meshId: DataId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPolyhedraPolyhedronAttributeNoDataColor: (meshId: DataId) => RGBAColor;
  setMeshPolyhedraPolyhedronAttributeNoDataColor: (
    meshId: DataId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export { isMeshPolyhedraPolyhedronAttributeValid };
export type {
  AttributeStoredConfig,
  AttributeState,
  ValidAttributeInput,
  UseMeshPolyhedraPolyhedronAttributeStyleReturn,
};
