import viewer_schemas, {
  type ViewerClippingPlanesParams,
} from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";
import type { SliceAxis } from "@ogw_front/utils/slice";
import { useHybridViewerCore } from "./core";
import { useViewerStore } from "@ogw_front/stores/viewer";

async function setClippingPlanes(
  ids: string[],
  planes: ViewerClippingPlanesParams["planes"],
): Promise<void> {
  const viewerStore = useViewerStore();
  const { remoteRender } = useHybridViewerCore();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.clipping_planes;
  const params = {
    ids,
    planes,
  };
  await viewerStore.request({
    schema,
    params,
  });
  await remoteRender();
}
async function setShrink(ids: string[], shrink_factor: number): Promise<void> {
  const viewerStore = useViewerStore();
  const { remoteRender } = useHybridViewerCore();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.shrink;
  const params = {
    ids,
    shrink_factor,
  };
  await viewerStore.request({
    schema,
    params,
  });
  await remoteRender();
}
async function setSlice(
  ids: string[],
  slices: { axis: SliceAxis; index: number }[],
): Promise<[number, number, number]> {
  const viewerStore = useViewerStore();
  const { remoteRender } = useHybridViewerCore();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.slice;
  const params = {
    ids,
    slices,
  };
  const {
    max_indices: [max_i = 0, max_j = 0, max_k = 0],
  } = await viewerStore.request({
    schema,
    params,
  });
  await remoteRender();
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
  const viewerStore = useViewerStore();
  const { remoteRender } = useHybridViewerCore();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.threshold;
  const params = {
    ids,
    attribute,
  };
  await viewerStore.request({
    schema,
    params,
  });
  await remoteRender();
}
function useHybridViewerFilters(): {
  setClippingPlanes: (ids: string[], planes: ViewerClippingPlanesParams["planes"]) => Promise<void>;
  setShrink: (ids: string[], shrink_factor: number) => Promise<void>;
  setSlice: (
    ids: string[],
    slices: { axis: SliceAxis; index: number }[],
  ) => Promise<[number, number, number]>;
  setThreshold: (ids: string[], attribute?: ThresholdAttribute) => Promise<void>;
} {
  return {
    setClippingPlanes,
    setShrink,
    setSlice,
    setThreshold,
  };
}
export { useHybridViewerFilters };
export type { ThresholdAttribute };
