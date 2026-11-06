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

interface UseMeshCellsCellAttributeStyleReturn {
  meshCellsCellAttributeName: (meshId: MeshId) => AttributeName | undefined;
  meshCellsCellAttributeItem: (meshId: MeshId) => AttributeItem;
  meshCellsCellAttributeRange: (meshId: MeshId) => AttributeRange;
  meshCellsCellAttributeTimeStep: (meshId: MeshId) => AttributeTimeStep | undefined;
  setMeshCellsCellAttributeTimeStep: (
    meshId: MeshId,
    timeStep: AttributeTimeStep,
  ) => Promise<unknown>;
  meshCellsCellAttributeColorMap: (meshId: MeshId) => AttributeColorMap | undefined;
  meshCellsCellAttributeStoredConfig: (
    meshId: MeshId,
    name: AttributeName | undefined,
    item: AttributeItem | undefined,
  ) => AttributeStoredConfig;
  setMeshCellsCellAttribute: (meshId: MeshId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshCellsCellAttributeName: (meshId: MeshId, name: AttributeName) => Promise<unknown>;
  setMeshCellsCellAttributeItem: (meshId: MeshId, item: AttributeItem) => Promise<unknown>;
  setMeshCellsCellAttributeRange: (
    meshId: MeshId,
    minimum: AttributeRangeMinimum,
    maximum: AttributeRangeMaximum,
  ) => Promise<unknown>;
  setMeshCellsCellAttributeColorMap: (
    meshId: MeshId,
    colorMap: AttributeColorMap | undefined,
  ) => Promise<unknown>;
  meshCellsCellAttributeNoDataColor: (meshId: MeshId) => RGBAColor;
  setMeshCellsCellAttributeNoDataColor: (
    meshId: MeshId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export type { UseMeshCellsCellAttributeStyleReturn };
