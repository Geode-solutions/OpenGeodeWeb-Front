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
  meshPolygonsPolygonAttributeName: (id: string) => string | undefined;
  meshPolygonsPolygonAttributeItem: (id: string) => number;
  meshPolygonsPolygonAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshPolygonsPolygonAttributeTimeStep: (id: string) => number | undefined;
  setMeshPolygonsPolygonAttributeTimeStep: (id: string, timeStep: number) => Promise<unknown>;
  meshPolygonsPolygonAttributeColorMap: (id: string) => string | undefined;
  meshPolygonsPolygonAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshPolygonsPolygonAttribute: (id: string, input: ValidAttributeInput) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeName: (id: string, name: string) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeItem: (id: string, item: number) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeRange: (
    id: string,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeColorMap: (
    id: string,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPolygonsPolygonAttributeNoDataColor: (id: string) => RGBAColor;
  setMeshPolygonsPolygonAttributeNoDataColor: (
    id: string,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export { isMeshPolygonsPolygonAttributeValid };
export type { UseMeshPolygonsPolygonAttributeStyleReturn };
