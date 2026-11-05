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

function isMeshPolygonsPolygonAttributeValid(input: AttributeInput): input is ValidAttributeInput {
  return (
    input.name !== undefined &&
    input.item !== undefined &&
    input.minimum !== undefined &&
    input.maximum !== undefined &&
    input.colorMap !== undefined
  );
}

interface UseMeshPolygonsPolygonAttributeStyleReturn {
  meshPolygonsPolygonAttributeName: (meshId: DataId) => string | undefined;
  meshPolygonsPolygonAttributeItem: (meshId: DataId) => number;
  meshPolygonsPolygonAttributeRange: (meshId: DataId) => [number | undefined, number | undefined];
  meshPolygonsPolygonAttributeTimeStep: (meshId: DataId) => number | undefined;
  setMeshPolygonsPolygonAttributeTimeStep: (meshId: DataId, timeStep: number) => Promise<unknown>;
  meshPolygonsPolygonAttributeColorMap: (meshId: DataId) => string | undefined;
  meshPolygonsPolygonAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshPolygonsPolygonAttribute: (meshId: DataId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeName: (meshId: DataId, name: string) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeItem: (meshId: DataId, item: number) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeRange: (
    meshId: DataId,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeColorMap: (
    meshId: DataId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPolygonsPolygonAttributeNoDataColor: (meshId: DataId) => RGBAColor;
  setMeshPolygonsPolygonAttributeNoDataColor: (
    meshId: DataId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export { isMeshPolygonsPolygonAttributeValid };
export type {
  AttributeStoredConfig,
  AttributeState,
  ValidAttributeInput,
  UseMeshPolygonsPolygonAttributeStyleReturn,
};
