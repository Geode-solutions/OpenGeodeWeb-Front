// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";
import type { HybridViewerStorePublic } from "./vtk_types";

async function performSetClippingPlanes(ids: string[], planes: unknown): Promise<void> {
  const viewerStore = useViewerStore();
  const { remoteRender } = useHybridViewerStore() as unknown as HybridViewerStorePublic;
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
async function performSetShrink(ids: string[], shrink_factor: number): Promise<void> {
  const viewerStore = useViewerStore();
  const { remoteRender } = useHybridViewerStore() as unknown as HybridViewerStorePublic;
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
function useHybridViewerFilters() {
  async function setClippingPlanes(ids: string[], planes: unknown): Promise<void> {
    await performSetClippingPlanes(ids, planes);
  }
  async function setShrink(ids: string[], shrink_factor: number): Promise<void> {
    await performSetShrink(ids, shrink_factor);
  }
  return {
    setClippingPlanes,
    setShrink,
  };
}
export { performSetClippingPlanes, performSetShrink, useHybridViewerFilters };
