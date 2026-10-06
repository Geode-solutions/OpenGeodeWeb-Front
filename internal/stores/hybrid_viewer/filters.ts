import type { JsonRpcSchema, ParamsOf, ResponseOf } from "@ogw_shared/utils/types.js";
import viewer_schemas, {
  type ViewerClippingPlanesParams,
} from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";
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
async function setThreshold(ids: string[], attribute?: ThresholdAttribute): Promise<void> {
  await requestAndRender(viewer_schemas.opengeodeweb_viewer.viewer.threshold, {
    ids,
    attribute,
  });
}
function useHybridViewerFilters(): {
  setClippingPlanes: (ids: string[], planes: ViewerClippingPlanesParams["planes"]) => Promise<void>;
  setShrink: (ids: string[], shrink_factor: number) => Promise<void>;
  setExplode: (ids: string[], explode_factor: number) => Promise<void>;
  setSlice: (
    ids: string[],
    slices: { axis: SliceAxis; index: number }[],
  ) => Promise<[number, number, number]>;
  setThreshold: (ids: string[], attribute?: ThresholdAttribute) => Promise<void>;
} {
  return {
    setClippingPlanes,
    setShrink,
    setExplode,
    setSlice,
    setThreshold,
  };
}
export { useHybridViewerFilters };
export type { ThresholdAttribute };
