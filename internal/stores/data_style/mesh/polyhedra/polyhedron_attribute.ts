import type { AttributeStoredConfig } from "@ogw_internal/stores/data_style/attribute_types";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

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
  meshPolyhedraPolyhedronAttributeName: (id: string) => string | undefined;
  meshPolyhedraPolyhedronAttributeItem: (id: string) => number;
  meshPolyhedraPolyhedronAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshPolyhedraPolyhedronAttributeTimeStep: (id: string) => number | undefined;
  setMeshPolyhedraPolyhedronAttributeTimeStep: (id: string, timeStep: number) => Promise<unknown>;
  meshPolyhedraPolyhedronAttributeColorMap: (id: string) => string | undefined;
  meshPolyhedraPolyhedronAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshPolyhedraPolyhedronAttribute: (id: string, input: ValidAttributeInput) => Promise<unknown>;
  setMeshPolyhedraPolyhedronAttributeName: (id: string, name: string) => Promise<unknown>;
  setMeshPolyhedraPolyhedronAttributeItem: (id: string, item: number) => Promise<unknown>;
  setMeshPolyhedraPolyhedronAttributeRange: (
    id: string,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPolyhedraPolyhedronAttributeColorMap: (
    id: string,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPolyhedraPolyhedronAttributeNoDataColor: (id: string) => RGBAColor;
  setMeshPolyhedraPolyhedronAttributeNoDataColor: (
    id: string,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export { isMeshPolyhedraPolyhedronAttributeValid };
export type { AttributeState, ValidAttributeInput, UseMeshPolyhedraPolyhedronAttributeStyleReturn };
