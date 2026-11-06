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

function isMeshPolygonsVertexAttributeValid(input: AttributeInput): input is ValidAttributeInput {
  return (
    input.name !== undefined &&
    input.item !== undefined &&
    input.minimum !== undefined &&
    input.maximum !== undefined &&
    input.colorMap !== undefined
  );
}

interface UseMeshPolygonsVertexAttributeStyleReturn {
  meshPolygonsVertexAttributeName: (id: string) => string | undefined;
  meshPolygonsVertexAttributeItem: (id: string) => number;
  meshPolygonsVertexAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshPolygonsVertexAttributeTimeStep: (id: string) => number | undefined;
  setMeshPolygonsVertexAttributeTimeStep: (id: string, timeStep: number) => Promise<unknown>;
  meshPolygonsVertexAttributeColorMap: (id: string) => string | undefined;
  meshPolygonsVertexAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshPolygonsVertexAttribute: (id: string, input: ValidAttributeInput) => Promise<unknown>;
  setMeshPolygonsVertexAttributeName: (id: string, name: string) => Promise<unknown>;
  setMeshPolygonsVertexAttributeItem: (id: string, item: number) => Promise<unknown>;
  setMeshPolygonsVertexAttributeRange: (
    id: string,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPolygonsVertexAttributeColorMap: (
    id: string,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPolygonsVertexAttributeNoDataColor: (id: string) => RGBAColor;
  setMeshPolygonsVertexAttributeNoDataColor: (
    id: string,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export { isMeshPolygonsVertexAttributeValid };
export type { UseMeshPolygonsVertexAttributeStyleReturn };
