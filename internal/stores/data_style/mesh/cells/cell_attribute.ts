import type {
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { DataId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface UseMeshCellsCellAttributeStyleReturn {
  meshCellsCellAttributeName: (meshId: DataId) => string | undefined;
  meshCellsCellAttributeItem: (meshId: DataId) => number;
  meshCellsCellAttributeRange: (meshId: DataId) => [number | undefined, number | undefined];
  meshCellsCellAttributeTimeStep: (meshId: DataId) => number | undefined;
  setMeshCellsCellAttributeTimeStep: (meshId: DataId, timeStep: number) => Promise<unknown>;
  meshCellsCellAttributeColorMap: (meshId: DataId) => string | undefined;
  meshCellsCellAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshCellsCellAttribute: (meshId: DataId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshCellsCellAttributeName: (meshId: DataId, name: string) => Promise<unknown>;
  setMeshCellsCellAttributeItem: (meshId: DataId, item: number) => Promise<unknown>;
  setMeshCellsCellAttributeRange: (
    meshId: DataId,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshCellsCellAttributeColorMap: (
    meshId: DataId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshCellsCellAttributeNoDataColor: (meshId: DataId) => RGBAColor;
  setMeshCellsCellAttributeNoDataColor: (
    meshId: DataId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export type { UseMeshCellsCellAttributeStyleReturn };
