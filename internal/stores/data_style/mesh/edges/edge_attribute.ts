import type {
  AttributeStoredConfig,
  ValidAttributeInput,
} from "@ogw_internal/stores/data_style/attribute_types";
import type { DataId } from "@ogw_front/types/identifiers";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface UseMeshEdgesEdgeAttributeStyleReturn {
  meshEdgesEdgeAttributeName: (meshId: DataId) => string | undefined;
  meshEdgesEdgeAttributeItem: (meshId: DataId) => number;
  meshEdgesEdgeAttributeRange: (meshId: DataId) => [number | undefined, number | undefined];
  meshEdgesEdgeAttributeTimeStep: (meshId: DataId) => number | undefined;
  setMeshEdgesEdgeAttributeTimeStep: (meshId: DataId, timeStep: number) => Promise<unknown>;
  meshEdgesEdgeAttributeColorMap: (meshId: DataId) => string | undefined;
  meshEdgesEdgeAttributeStoredConfig: (
    meshId: DataId,
    name: string | undefined,
    item: number | undefined,
  ) => AttributeStoredConfig;
  setMeshEdgesEdgeAttribute: (meshId: DataId, input: ValidAttributeInput) => Promise<unknown>;
  setMeshEdgesEdgeAttributeName: (meshId: DataId, name: string) => Promise<unknown>;
  setMeshEdgesEdgeAttributeItem: (meshId: DataId, item: number) => Promise<unknown>;
  setMeshEdgesEdgeAttributeRange: (
    meshId: DataId,
    minimum: number,
    maximum: number,
  ) => Promise<unknown>;
  setMeshEdgesEdgeAttributeColorMap: (
    meshId: DataId,
    colorMap: string | undefined,
  ) => Promise<unknown>;
  meshEdgesEdgeAttributeNoDataColor: (meshId: DataId) => RGBAColor;
  setMeshEdgesEdgeAttributeNoDataColor: (
    meshId: DataId,
    no_data_color: RGBAColor,
  ) => Promise<unknown>;
}
export type { UseMeshEdgesEdgeAttributeStyleReturn };
