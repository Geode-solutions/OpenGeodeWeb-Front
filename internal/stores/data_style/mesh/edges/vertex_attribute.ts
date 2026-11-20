import type {
  AttributeColorMap,
  AttributeRange,
  AttributeTimeStep,
} from "@ogw_front/types/attribute";
import type {
  AttributeItem,
  AttributeName,
  AttributeRangeMaximum,
  AttributeRangeMinimum,
  ColorRGBA,
} from "@geode/opengeodeweb-viewer/schema_types";
import type {
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";

interface UseMeshEdgesVertexAttributeStyleReturn {
  meshEdgesVertexAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshEdgesVertexAttributeItem: (meshId: MeshId) => AttributeItem;
  meshEdgesVertexAttributeRange: (meshId: MeshId) => AttributeRange;
  meshEdgesVertexAttributeTimeStep: (meshId: MeshId) => AttributeTimeStep | undefined;
  setMeshEdgesVertexAttributeTimeStep: (
    meshId: MeshId,
    timeStep: AttributeTimeStep,
  ) => Promise<unknown>;
  meshEdgesVertexAttributeColorMap: (meshId: MeshId) => AttributeColorMap | undefined;
  meshEdgesVertexAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
  setMeshEdgesVertexAttribute: (meshId: MeshId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshEdgesVertexAttributeName: (meshId: MeshId, name: AttributeName) => Promise<unknown>;
  setMeshEdgesVertexAttributeItem: (meshId: MeshId, item: AttributeItem) => Promise<unknown>;
  setMeshEdgesVertexAttributeRange: (
    meshId: MeshId,
    minimum: AttributeRangeMinimum,
    maximum: AttributeRangeMaximum,
  ) => Promise<unknown>;
  setMeshEdgesVertexAttributeColorMap: (
    meshId: MeshId,
    colorMap: AttributeColorMap | undefined,
  ) => Promise<unknown>;
  meshEdgesVertexAttributeNoDataColor: (meshId: MeshId) => ColorRGBA;
  setMeshEdgesVertexAttributeNoDataColor: (
    meshId: MeshId,
    no_data_color: ColorRGBA,
  ) => Promise<unknown>;
}
export type { UseMeshEdgesVertexAttributeStyleReturn };
