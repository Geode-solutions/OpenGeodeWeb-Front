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
function useHybridViewerFilters(): {
  setClippingPlanes: (ids: string[], planes: unknown) => Promise<void>;
  setShrink: (ids: string[], shrink_factor: number) => Promise<void>;
} {
  return {
    setClippingPlanes,
    setShrink,
  };
}
export { useHybridViewerFilters };
