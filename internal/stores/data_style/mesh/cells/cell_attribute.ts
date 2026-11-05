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
  meshCellsCellAttributeName: (id: string) => string | undefined;
  meshCellsCellAttributeItem: (id: string) => number;
  meshCellsCellAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshCellsCellAttributeTimeStep: (id: string) => number | undefined;
  setMeshCellsCellAttributeTimeStep: (id: string, timeStep: number) => Promise<unknown>;
  meshCellsCellAttributeColorMap: (id: string) => string | undefined;
  meshCellsCellAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshCellsCellAttribute: (id: string, input: ValidAttributeInput) => Promise<unknown>;
  setMeshCellsCellAttributeName: (id: string, name: string) => Promise<unknown>;
  setMeshCellsCellAttributeItem: (id: string, item: number) => Promise<unknown>;
  setMeshCellsCellAttributeRange: (
    id: string,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshCellsCellAttributeColorMap: (id: string, colorMap: string | undefined) => Promise<unknown>;
  meshCellsCellAttributeNoDataColor: (id: string) => RGBAColor;
  setMeshCellsCellAttributeNoDataColor: (id: string, no_data_color: RGBAColor) => Promise<unknown>;
}
export { isMeshCellsCellAttributeValid };
export type {
  AttributeStoredConfig,
  AttributeState,
  ValidAttributeInput,
  UseMeshCellsCellAttributeStyleReturn,
};
