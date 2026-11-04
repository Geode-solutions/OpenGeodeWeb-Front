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
  meshPolyhedraVertexAttributeName: (id: string) => string | undefined;
  meshPolyhedraVertexAttributeItem: (id: string) => number;
  meshPolyhedraVertexAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshPolyhedraVertexAttributeTimeStep: (id: string) => number | undefined;
  setMeshPolyhedraVertexAttributeTimeStep: (id: string, timeStep: number) => Promise<unknown>;
  meshPolyhedraVertexAttributeColorMap: (id: string) => string | undefined;
  meshPolyhedraVertexAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshPolyhedraVertexAttribute: (id: string, input: ValidAttributeInput) => Promise<unknown>;
  setMeshPolyhedraVertexAttributeName: (id: string, name: string) => Promise<unknown>;
  setMeshPolyhedraVertexAttributeItem: (id: string, item: number) => Promise<unknown>;
  setMeshPolyhedraVertexAttributeRange: (
    id: string,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPolyhedraVertexAttributeColorMap: (
    id: string,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPolyhedraVertexAttributeNoDataColor: (id: string) => RGBAColor;
  setMeshPolyhedraVertexAttributeNoDataColor: (
    id: string,
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
