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
  meshPointsVertexAttributeName: (id: string) => string | undefined;
  meshPointsVertexAttributeItem: (id: string) => number;
  meshPointsVertexAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshPointsVertexAttributeTimeStep: (id: string) => number | undefined;
  setMeshPointsVertexAttributeTimeStep: (id: string, timeStep: number) => Promise<unknown>;
  meshPointsVertexAttributeColorMap: (id: string) => string | undefined;
  meshPointsVertexAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshPointsVertexAttribute: (id: string, input: ValidAttributeInput) => Promise<unknown>;
  setMeshPointsVertexAttributeName: (id: string, name: string) => Promise<unknown>;
  setMeshPointsVertexAttributeItem: (id: string, item: number) => Promise<unknown>;
  setMeshPointsVertexAttributeRange: (
    id: string,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPointsVertexAttributeColorMap: (
    id: string,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPointsVertexAttributeNoDataColor: (id: string) => RGBAColor;
  setMeshPointsVertexAttributeNoDataColor: (
    id: string,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export { isMeshPointsVertexAttributeValid };
export type { UseMeshPointsVertexAttributeStyleReturn };
