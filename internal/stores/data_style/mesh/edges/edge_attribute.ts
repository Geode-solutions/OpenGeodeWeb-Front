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

function isMeshEdgesEdgeAttributeValid(input: AttributeInput): input is ValidAttributeInput {
  return (
    input.name !== undefined &&
    input.item !== undefined &&
    input.minimum !== undefined &&
    input.maximum !== undefined &&
    input.colorMap !== undefined
  );
}

interface UseMeshEdgesEdgeAttributeStyleReturn {
  meshEdgesEdgeAttributeName: (id: string) => string | undefined;
  meshEdgesEdgeAttributeItem: (id: string) => number;
  meshEdgesEdgeAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshEdgesEdgeAttributeTimeStep: (id: string) => number | undefined;
  setMeshEdgesEdgeAttributeTimeStep: (id: string, timeStep: number) => Promise<unknown>;
  meshEdgesEdgeAttributeColorMap: (id: string) => string | undefined;
  meshEdgesEdgeAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshEdgesEdgeAttribute: (id: string, input: ValidAttributeInput) => Promise<unknown>;
  setMeshEdgesEdgeAttributeName: (id: string, name: string) => Promise<unknown>;
  setMeshEdgesEdgeAttributeItem: (id: string, item: number) => Promise<unknown>;
  setMeshEdgesEdgeAttributeRange: (
    id: string,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshEdgesEdgeAttributeColorMap: (id: string, colorMap: string | undefined) => Promise<unknown>;
  meshEdgesEdgeAttributeNoDataColor: (id: string) => RGBAColor;
  setMeshEdgesEdgeAttributeNoDataColor: (id: string, no_data_color: RGBAColor) => Promise<unknown>;
}
export { isMeshEdgesEdgeAttributeValid };
export type {
  AttributeStoredConfig,
  AttributeState,
  ValidAttributeInput,
  UseMeshEdgesEdgeAttributeStyleReturn,
};
