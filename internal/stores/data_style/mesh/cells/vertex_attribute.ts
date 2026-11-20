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
} from "@geode/opengeodeweb-viewer/schema_types";
import type {
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { MeshId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface UseMeshCellsVertexAttributeStyleReturn {
  meshCellsVertexAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshCellsVertexAttributeItem: (meshId: MeshId) => AttributeItem;
  meshCellsVertexAttributeRange: (meshId: MeshId) => AttributeRange;
  meshCellsVertexAttributeTimeStep: (meshId: MeshId) => AttributeTimeStep | undefined;
  setMeshCellsVertexAttributeTimeStep: (
    meshId: MeshId,
    timeStep: AttributeTimeStep,
  ) => Promise<unknown>;
  meshCellsVertexAttributeColorMap: (meshId: MeshId) => AttributeColorMap | undefined;
  meshCellsVertexAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
  setMeshCellsVertexAttribute: (meshId: MeshId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshCellsVertexAttributeName: (meshId: MeshId, name: AttributeName) => Promise<unknown>;
  setMeshCellsVertexAttributeItem: (meshId: MeshId, item: AttributeItem) => Promise<unknown>;
  setMeshCellsVertexAttributeRange: (
    meshId: MeshId,
    minimum: AttributeRangeMinimum,
    maximum: AttributeRangeMaximum,
  ) => Promise<unknown>;
  setMeshCellsVertexAttributeColorMap: (
    meshId: MeshId,
    colorMap: AttributeColorMap | undefined,
  ) => Promise<unknown>;
  meshCellsVertexAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
  setMeshCellsVertexAttributeNoDataColor: (
    meshId: MeshId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export type { UseMeshCellsVertexAttributeStyleReturn };
