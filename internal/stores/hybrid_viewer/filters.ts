import { useHybridViewerCore } from "./core";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

async function setClippingPlanes(ids: string[], planes: unknown): Promise<void> {
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
async function setSlice(ids: string[], axis: number | null, index: number): Promise<number> {
  const viewerStore = useViewerStore();
  const { remoteRender } = useHybridViewerCore();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.slice;
  const params = {
    ids,
    axis,
    index,
  };
  const response = await viewerStore.request({
    schema,
    params,
  });
  await remoteRender();
  // oxlint-disable-next-line no-unsafe-type-assertion -- response shape is defined by the slice schema.
  return (response as { max_index: number }).max_index;
}
function useHybridViewerFilters(): {
  setClippingPlanes: (ids: string[], planes: unknown) => Promise<void>;
  setShrink: (ids: string[], shrink_factor: number) => Promise<void>;
  setSlice: (ids: string[], axis: number | null, index: number) => Promise<number>;
} {
  return {
    setClippingPlanes,
    setShrink,
    setSlice,
  };
}
export { useHybridViewerFilters };
