import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

function useHybridViewerFilters() {
  async function setClippingPlanes(ids, planes) {
    await performSetClippingPlanes(ids, planes);
  }

  async function setShrink(ids, shrink_factor) {
    await performSetShrink(ids, shrink_factor);
  }

  return {
    setClippingPlanes,
    setShrink,
  };
}

async function performSetClippingPlanes(ids, planes) {
  const viewerStore = useViewerStore();
  const { remoteRender } = useHybridViewerStore();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.clipping_planes;
  const params = { ids, planes };
  await viewerStore.request({ schema, params });
  await remoteRender();
}

async function performSetShrink(ids, shrink_factor) {
  const viewerStore = useViewerStore();
  const { remoteRender } = useHybridViewerStore();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.shrink;
  const params = { ids, shrink_factor };
  await viewerStore.request({ schema, params });
  await remoteRender();
}

export { performSetClippingPlanes, performSetShrink, useHybridViewerFilters };
