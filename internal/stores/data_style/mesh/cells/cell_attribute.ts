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

function isMeshCellsCellAttributeValid(input: AttributeInput): input is ValidAttributeInput {
  return (
    input.name !== undefined &&
    input.item !== undefined &&
    input.minimum !== undefined &&
    input.maximum !== undefined &&
    input.colorMap !== undefined
  );
}

interface UseMeshCellsCellAttributeStyleReturn {
  meshCellsCellAttributeName: (meshId: DataId) => string | undefined;
  meshCellsCellAttributeItem: (meshId: DataId) => number;
  meshCellsCellAttributeRange: (meshId: DataId) => [number | undefined, number | undefined];
  meshCellsCellAttributeTimeStep: (meshId: DataId) => number | undefined;
  setMeshCellsCellAttributeTimeStep: (meshId: DataId, timeStep: number) => Promise<unknown>;
  meshCellsCellAttributeColorMap: (meshId: DataId) => string | undefined;
  meshCellsCellAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshCellsCellAttribute: (meshId: DataId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshCellsCellAttributeName: (meshId: DataId, name: string) => Promise<unknown>;
  setMeshCellsCellAttributeItem: (meshId: DataId, item: number) => Promise<unknown>;
  setMeshCellsCellAttributeRange: (
    meshId: DataId,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshCellsCellAttributeColorMap: (
    meshId: DataId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshCellsCellAttributeNoDataColor: (meshId: DataId) => RGBAColor;
  setMeshCellsCellAttributeNoDataColor: (
    meshId: DataId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export { isMeshCellsCellAttributeValid };
export type {
  AttributeStoredConfig,
  AttributeState,
  ValidAttributeInput,
  UseMeshCellsCellAttributeStyleReturn,
};
