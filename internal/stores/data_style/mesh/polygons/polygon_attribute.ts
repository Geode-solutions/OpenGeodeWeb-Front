import type {
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface UseMeshPolygonsPolygonAttributeStyleReturn {
  meshPolygonsPolygonAttributeName: (meshId: MeshId) => string | undefined;
  meshPolygonsPolygonAttributeItem: (meshId: MeshId) => number;
  meshPolygonsPolygonAttributeRange: (meshId: MeshId) => [number | undefined, number | undefined];
  meshPolygonsPolygonAttributeTimeStep: (meshId: MeshId) => number | undefined;
  setMeshPolygonsPolygonAttributeTimeStep: (meshId: MeshId, timeStep: number) => Promise<unknown>;
  meshPolygonsPolygonAttributeColorMap: (meshId: MeshId) => string | undefined;
  meshPolygonsPolygonAttributeStoredConfig: (
    meshId: MeshId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshPolygonsPolygonAttribute: (meshId: MeshId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeName: (meshId: MeshId, name: string) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeItem: (meshId: MeshId, item: number) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeRange: (
    meshId: MeshId,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshPolygonsPolygonAttributeColorMap: (
    meshId: MeshId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshPolygonsPolygonAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
  setMeshPolygonsPolygonAttributeNoDataColor: (
    meshId: MeshId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export type { UseMeshPolygonsPolygonAttributeStyleReturn };
