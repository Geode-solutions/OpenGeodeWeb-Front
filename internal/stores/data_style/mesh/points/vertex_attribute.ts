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

interface UseMeshPointsVertexAttributeStyleReturn {
  meshPointsVertexAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshPointsVertexAttributeItem: (meshId: MeshId) => AttributeItem;
  meshPointsVertexAttributeRange: (meshId: MeshId) => AttributeRange;
  meshPointsVertexAttributeTimeStep: (meshId: MeshId) => AttributeTimeStep | undefined;
  setMeshPointsVertexAttributeTimeStep: (
    meshId: MeshId,
    timeStep: AttributeTimeStep,
  ) => Promise<unknown>;
  meshPointsVertexAttributeColorMap: (meshId: MeshId) => AttributeColorMap | undefined;
  meshPointsVertexAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
  setMeshPointsVertexAttribute: (meshId: MeshId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshPointsVertexAttributeName: (meshId: MeshId, name: AttributeName) => Promise<unknown>;
  setMeshPointsVertexAttributeItem: (meshId: MeshId, item: AttributeItem) => Promise<unknown>;
  setMeshPointsVertexAttributeRange: (
    meshId: MeshId,
    minimum: AttributeRangeMinimum,
    maximum: AttributeRangeMaximum,
  ) => Promise<unknown>;
  setMeshPointsVertexAttributeColorMap: (
    meshId: MeshId,
    colorMap: AttributeColorMap | undefined,
  ) => Promise<unknown>;
  meshPointsVertexAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
  setMeshPointsVertexAttributeNoDataColor: (
    meshId: MeshId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export type { UseMeshPointsVertexAttributeStyleReturn };
