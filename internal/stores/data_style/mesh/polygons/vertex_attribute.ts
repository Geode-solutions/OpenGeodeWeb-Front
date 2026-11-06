import type {
  AttributeColorMap,
  AttributeItem,
  AttributeName,
  AttributeRange,
  AttributeRangeMaximum,
  AttributeRangeMinimum,
  AttributeTimeStep,
} from "@ogw_front/types/attribute";
import type {
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface UseMeshPolygonsVertexAttributeStyleReturn {
  meshPolygonsVertexAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshPolygonsVertexAttributeItem: (meshId: MeshId) => AttributeItem;
  meshPolygonsVertexAttributeRange: (meshId: MeshId) => AttributeRange;
  meshPolygonsVertexAttributeTimeStep: (meshId: MeshId) => AttributeTimeStep | undefined;
  setMeshPolygonsVertexAttributeTimeStep: (
    meshId: MeshId,
    timeStep: AttributeTimeStep,
  ) => Promise<unknown>;
  meshPolygonsVertexAttributeColorMap: (meshId: MeshId) => AttributeColorMap | undefined;
  meshPolygonsVertexAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
  setMeshPolygonsVertexAttribute: (meshId: MeshId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshPolygonsVertexAttributeName: (meshId: MeshId, name: AttributeName) => Promise<unknown>;
  setMeshPolygonsVertexAttributeItem: (meshId: MeshId, item: AttributeItem) => Promise<unknown>;
  setMeshPolygonsVertexAttributeRange: (
    meshId: MeshId,
    minimum: AttributeRangeMinimum,
    maximum: AttributeRangeMaximum,
  ) => Promise<unknown>;
  setMeshPolygonsVertexAttributeColorMap: (
    meshId: MeshId,
    colorMap: AttributeColorMap | undefined,
  ) => Promise<unknown>;
  meshPolygonsVertexAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
  setMeshPolygonsVertexAttributeNoDataColor: (
    meshId: MeshId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export type { UseMeshPolygonsVertexAttributeStyleReturn };
