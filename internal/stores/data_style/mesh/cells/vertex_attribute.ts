import type {
  AttributeInput,
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

function isMeshCellsVertexAttributeValid(input: AttributeInput): input is ValidAttributeInput {
  return (
    input.name !== undefined &&
    input.item !== undefined &&
    input.minimum !== undefined &&
    input.maximum !== undefined &&
    input.colorMap !== undefined
  );
}

interface UseMeshCellsVertexAttributeStyleReturn {
  meshCellsVertexAttributeName: (id: string) => string | undefined;
  meshCellsVertexAttributeItem: (id: string) => number;
  meshCellsVertexAttributeRange: (id: string) => [number | undefined, number | undefined];
  meshCellsVertexAttributeTimeStep: (id: string) => number | undefined;
  setMeshCellsVertexAttributeTimeStep: (id: string, timeStep: number) => Promise<unknown>;
  meshCellsVertexAttributeColorMap: (id: string) => string | undefined;
  meshCellsVertexAttributeStoredConfig: (
    id: string,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshCellsVertexAttribute: (id: string, input: ValidAttributeInput) => Promise<unknown>;
  setMeshCellsVertexAttributeName: (id: string, name: string) => Promise<unknown>;
  setMeshCellsVertexAttributeItem: (id: string, item: number) => Promise<unknown>;
  setMeshCellsVertexAttributeRange: (
    id: string,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshCellsVertexAttributeColorMap: (
    id: string,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshCellsVertexAttributeNoDataColor: (id: string) => RGBAColor;
  setMeshCellsVertexAttributeNoDataColor: (
    id: string,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export { isMeshCellsVertexAttributeValid };
export type { UseMeshCellsVertexAttributeStyleReturn };
