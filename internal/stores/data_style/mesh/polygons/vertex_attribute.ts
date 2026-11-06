import type {
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface UseMeshPolygonsVertexAttributeStyleReturn {
  meshPolygonsVertexAttributeName: (meshId: MeshId) => string | undefined;
  meshPolygonsVertexAttributeItem: (meshId: MeshId) => number;
  meshPolygonsVertexAttributeRange: (meshId: MeshId) => [number | undefined, number | undefined];
  meshPolygonsVertexAttributeTimeStep: (meshId: MeshId) => number | undefined;
  setMeshPolygonsVertexAttributeTimeStep: (meshId: MeshId, timeStep: number) => Promise<unknown>;
  meshPolygonsVertexAttributeColorMap: (meshId: MeshId) => string | undefined;
  meshPolygonsVertexAttributeStoredConfig: (
    meshId: MeshId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshPolygonsVertexAttribute: (meshId: MeshId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshPolygonsVertexAttributeName: (meshId: MeshId, name: string) => Promise<unknown>;
  setMeshPolygonsVertexAttributeItem: (meshId: MeshId, item: number) => Promise<unknown>;
  setMeshPolygonsVertexAttributeRange: (
    meshId: MeshId,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPolygonsVertexAttributeColorMap: (
    meshId: MeshId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPolygonsVertexAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
  setMeshPolygonsVertexAttributeNoDataColor: (
    meshId: MeshId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export type { UseMeshPolygonsVertexAttributeStyleReturn };
