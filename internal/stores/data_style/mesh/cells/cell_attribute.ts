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
    item: AttributeItem,
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
    colorMap: AttributeColorMap,
  ) => Promise<unknown>;
  meshCellsCellAttributeNoDataColor: (meshId: MeshId) => ColorRGBA;
  setMeshCellsCellAttributeNoDataColor: (
    meshId: MeshId,
    no_data_color: ColorRGBA,
  ) => Promise<unknown>;
}
export type { UseMeshCellsCellAttributeStyleReturn };
