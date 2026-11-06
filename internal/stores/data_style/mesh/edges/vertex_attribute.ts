import type {
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface AttributeInput {
  name: string | undefined;
  item: number | undefined;
  minimum: number | undefined;
  maximum: number | undefined;
  colorMap: string | undefined;
  no_data_color?: RGBAColor;
}

function isMeshEdgesVertexAttributeValid(input: AttributeInput): input is ValidAttributeInput {
  return (
    input.name !== undefined &&
    input.item !== undefined &&
    input.minimum !== undefined &&
    input.maximum !== undefined &&
    input.colorMap !== undefined
  );
}

interface UseMeshEdgesVertexAttributeStyleReturn {
  meshEdgesVertexAttributeName: (id: string) => string | undefined;
  meshEdgesVertexAttributeItem: (id: string) => number;
  meshEdgesVertexAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshEdgesVertexAttributeTimeStep: (id: string) => number | undefined;
  setMeshEdgesVertexAttributeTimeStep: (id: string, timeStep: number) => Promise<unknown>;
  meshEdgesVertexAttributeColorMap: (id: string) => string | undefined;
  meshEdgesVertexAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshEdgesVertexAttribute: (id: string, input: ValidAttributeInput) => Promise<unknown>;
  setMeshEdgesVertexAttributeName: (id: string, name: string) => Promise<unknown>;
  setMeshEdgesVertexAttributeItem: (id: string, item: number) => Promise<unknown>;
  setMeshEdgesVertexAttributeRange: (
    id: string,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshEdgesVertexAttributeColorMap: (
    id: string,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshEdgesVertexAttributeNoDataColor: (id: string) => RGBAColor;
  setMeshEdgesVertexAttributeNoDataColor: (
    id: string,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export { isMeshEdgesVertexAttributeValid };
export type { UseMeshEdgesVertexAttributeStyleReturn };
