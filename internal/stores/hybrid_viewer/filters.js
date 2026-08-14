import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

function useHybridViewerFilters(options) {
  const { remoteRender } = options;
  const viewerStore = useViewerStore();

  async function setClippingPlanes(ids, planes) {
    await performSetClippingPlanes(ids, planes, { viewerStore, remoteRender });
  }

  async function setShrink(ids, shrink_factor) {
    await performSetShrink(ids, shrink_factor, { viewerStore, remoteRender });
  }

  return {
    setClippingPlanes,
    setShrink,
  };
}

async function performSetClippingPlanes(ids, planes, options) {
  const { viewerStore, remoteRender } = options;
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.clipping_planes;
  const params = { ids, planes };
  await viewerStore.request({ schema, params });
  await remoteRender();
}

async function performSetShrink(ids, shrink_factor, options) {
  const { viewerStore, remoteRender } = options;
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.shrink;
  const params = { ids, shrink_factor };
  await viewerStore.request({ schema, params });
  await remoteRender();
}

export { performSetClippingPlanes, performSetShrink, useHybridViewerFilters };
