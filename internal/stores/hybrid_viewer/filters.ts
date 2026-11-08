import type { JsonRpcSchema, ParamsOf, ResponseOf } from "@ogw_shared/utils/types.js";
import viewer_schemas, {
  type ViewerClippingPlanesParams,
} from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";
import type { AttributeName } from "@ogw_front/types/attribute";
import type { DataId } from "@ogw_front/types/identifiers";
import type { SliceAxis } from "@ogw_front/utils/slice";
import { useHybridViewerCore } from "./core";
import { useViewerStore } from "@ogw_front/stores/viewer";

async function requestAndRender<Schema extends JsonRpcSchema>(
  schema: Schema,
  params: ParamsOf<Schema>,
): Promise<ResponseOf<Schema>> {
  const viewerStore = useViewerStore();
  const { remoteRender } = useHybridViewerCore();
  const response = await viewerStore.request({
    schema,
    params,
  });
  await remoteRender();
  return response;
}

async function setClippingPlanes(
  ids: string[],
  planes: ViewerClippingPlanesParams["planes"],
): Promise<void> {
  await requestAndRender(viewer_schemas.opengeodeweb_viewer.viewer.clipping_planes, {
    ids,
    planes,
  });
}
async function setShrink(ids: string[], shrink_factor: number): Promise<void> {
  await requestAndRender(viewer_schemas.opengeodeweb_viewer.viewer.shrink, {
    ids,
    shrink_factor,
  });
}
async function setExplode(ids: string[], explode_factor: number): Promise<void> {
  await requestAndRender(viewer_schemas.opengeodeweb_viewer.viewer.explode, {
    ids,
    explode_factor,
  });
}
async function setSlice(
  ids: string[],
  slices: { axis: SliceAxis; index: number }[],
): Promise<[number, number, number]> {
  const {
    max_indices: [max_i = 0, max_j = 0, max_k = 0],
  } = await requestAndRender(viewer_schemas.opengeodeweb_viewer.viewer.slice, {
    ids,
    slices,
  });
  return [max_i, max_j, max_k];
}
interface ThresholdAttribute {
  name: string;
  location: "point" | "cell";
  item: number;
  minimum: number;
  maximum: number;
}
interface Threshold {
  id: number;
  sourceIndex: number | undefined;
  attributeName: AttributeName | undefined;
  item: number;
  minimum: number | undefined;
  maximum: number | undefined;
  thresholdAttribute: ThresholdAttribute | undefined;
}
async function setThreshold(ids: string[], attributes: ThresholdAttribute[]): Promise<void> {
  await requestAndRender(viewer_schemas.opengeodeweb_viewer.viewer.threshold, {
    ids,
    attributes,
  });
}
function useHybridViewerFilters(): {
  setClippingPlanes: typeof setClippingPlanes;
  setShrink: typeof setShrink;
  setExplode: typeof setExplode;
  setSlice: typeof setSlice;
  setThreshold: typeof setThreshold;
  getThresholds: (dataId: DataId) => Threshold[];
  addThreshold: (dataId: DataId) => void;
  removeThreshold: (dataId: DataId, index: number) => void;
  removeThresholds: (dataId: DataId) => void;
} {
  const thresholds = reactive<Record<string, Threshold[]>>({});
  let lastThresholdId = 0;

  function getThresholds(dataId: DataId): Threshold[] {
    return thresholds[dataId] ?? [];
  }

  function addThreshold(dataId: DataId): void {
    lastThresholdId += 1;
    thresholds[dataId] ??= [];
    thresholds[dataId].push({
      id: lastThresholdId,
      sourceIndex: undefined,
      attributeName: undefined,
      item: 0,
      minimum: undefined,
      maximum: undefined,
      thresholdAttribute: undefined,
    });
  }

  function removeThreshold(dataId: DataId, index: number): void {
    thresholds[dataId]?.splice(index, 1);
  }

  function removeThresholds(dataId: DataId): void {
    thresholds[dataId] = [];
  }

  return {
    setClippingPlanes,
    setShrink,
    setExplode,
    setSlice,
    setThreshold,
    getThresholds,
    addThreshold,
    removeThreshold,
    removeThresholds,
  };
}
export { useHybridViewerFilters };
export type { Threshold, ThresholdAttribute };
