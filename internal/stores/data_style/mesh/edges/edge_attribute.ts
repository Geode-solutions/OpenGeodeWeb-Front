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

interface UseMeshEdgesEdgeAttributeStyleReturn {
  meshEdgesEdgeAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshEdgesEdgeAttributeItem: (meshId: MeshId) => AttributeItem;
  meshEdgesEdgeAttributeRange: (meshId: MeshId) => AttributeRange;
  meshEdgesEdgeAttributeTimeStep: (meshId: MeshId) => AttributeTimeStep | undefined;
  setMeshEdgesEdgeAttributeTimeStep: (
    meshId: MeshId,
    timeStep: AttributeTimeStep,
  ) => Promise<unknown>;
  meshEdgesEdgeAttributeColorMap: (meshId: MeshId) => AttributeColorMap | undefined;
  meshEdgesEdgeAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
  setMeshEdgesEdgeAttribute: (meshId: MeshId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshEdgesEdgeAttributeName: (meshId: MeshId, name: AttributeName) => Promise<unknown>;
  setMeshEdgesEdgeAttributeItem: (meshId: MeshId, item: AttributeItem) => Promise<unknown>;
  setMeshEdgesEdgeAttributeRange: (
    meshId: MeshId,
    minimum: AttributeRangeMinimum,
    maximum: AttributeRangeMaximum,
  ) => Promise<unknown>;
  setMeshEdgesEdgeAttributeColorMap: (
    meshId: MeshId,
    colorMap: AttributeColorMap | undefined,
  ) => Promise<unknown>;
  meshEdgesEdgeAttributeNoDataColor: (meshId: MeshId) => ColorRGBA;
  setMeshEdgesEdgeAttributeNoDataColor: (
    meshId: MeshId,
    no_data_color: ColorRGBA,
  ) => Promise<unknown>;
}
export type { UseMeshEdgesEdgeAttributeStyleReturn };
