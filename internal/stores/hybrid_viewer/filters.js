function useHybridViewerFilters(options) {
  const { viewerStore, viewer_schemas, remoteRender } = options;

  async function setClippingPlanes(ids, planes) {
    await performSetClippingPlanes(ids, planes, { viewerStore, viewer_schemas, remoteRender });
  }

  async function setShrink(ids, shrink_factor) {
    await performSetShrink(ids, shrink_factor, { viewerStore, viewer_schemas, remoteRender });
  }

  return {
    setClippingPlanes,
    setShrink,
  };
}

async function performSetClippingPlanes(ids, planes, options) {
  const { viewerStore, viewer_schemas, remoteRender } = options;
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.clipping_planes;
  const params = { ids, planes };
  await viewerStore.request({ schema, params });
  await remoteRender();
}

async function performSetShrink(ids, shrink_factor, options) {
  const { viewerStore, viewer_schemas, remoteRender } = options;
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.shrink;
  const params = { ids, shrink_factor };
  await viewerStore.request({ schema, params });
  await remoteRender();
}

export { performSetClippingPlanes, performSetShrink, useHybridViewerFilters };
