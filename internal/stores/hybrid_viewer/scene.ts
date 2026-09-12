import { ACTOR_COLOR } from "./constants";
import { useDataStore } from "@ogw_front/stores/data";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";
import { newInstance as vtkActor } from "@kitware/vtk.js/Rendering/Core/Actor";
import { newInstance as vtkMapper } from "@kitware/vtk.js/Rendering/Core/Mapper";
import { newInstance as vtkXMLPolyDataReader } from "@kitware/vtk.js/IO/XML/XMLPolyDataReader";
import type { HybridDb, HybridViewerStorePublic, vtkActor as VtkActorInstance } from "./vtk_types";

async function performAddItem(id: string): Promise<void> {
  const { genericRenderWindow, hybridDb } =
    useHybridViewerStore() as unknown as HybridViewerStorePublic;
  if (!genericRenderWindow.value) {
    return;
  }
  const dataStore = useDataStore();
  const value = await dataStore.item(id);
  if (value && !dataStore.isItemViewable(value)) {
    return;
  }
  const reader = vtkXMLPolyDataReader();
  await reader.parseAsArrayBuffer(
    new TextEncoder().encode(value.binary_light_viewable as string).buffer as ArrayBuffer,
  );
  const actor = vtkActor();
  const mapper = vtkMapper();
  const polydata = reader.getOutputData(0);
  mapper.setInputData(polydata);
  const property = actor.getProperty();
  property.setColor(ACTOR_COLOR);
  actor.setMapper(mapper);
  const renderer = genericRenderWindow.value.getRenderer();
  if (hybridDb[id] && hybridDb[id].actor) {
    renderer.removeActor(hybridDb[id].actor);
  }
  const actors = renderer.getActors();
  const isFirst = actors.length === 0;
  renderer.addActor(actor);
  if (isFirst) {
    renderer.resetCamera();
  }
  hybridDb[id] = {
    actor,
    polydata,
    mapper,
  };
}
function performRemoveItem(id: string): void {
  const { genericRenderWindow, hybridDb } =
    useHybridViewerStore() as unknown as HybridViewerStorePublic;
  if (!hybridDb[id]) {
    return;
  }
  const renderer = genericRenderWindow.value!.getRenderer();
  renderer.removeActor(hybridDb[id]!.actor);
  const renderWindow = genericRenderWindow.value!.getRenderWindow();
  renderWindow.render();
  delete hybridDb[id];
}
function performSetVisibility(id: string, visibility: boolean): void {
  const { genericRenderWindow, hybridDb } =
    useHybridViewerStore() as unknown as HybridViewerStorePublic;
  if (!hybridDb[id]) {
    return;
  }
  hybridDb[id]!.actor.setVisibility(visibility);
  const renderWindow = genericRenderWindow.value!.getRenderWindow();
  renderWindow.render();
}
async function performSetZScaling(z_scale: number): Promise<void> {
  const hybridViewerStore = useHybridViewerStore();
  const { genericRenderWindow, remoteRender } =
    hybridViewerStore as unknown as HybridViewerStorePublic;
  const { zScale } = storeToRefs(hybridViewerStore) as unknown as { zScale: Ref<number> };
  zScale.value = z_scale;
  const renderer = genericRenderWindow.value!.getRenderer();
  for (const actor of renderer.getActors() as VtkActorInstance[]) {
    const scale = actor.getScale();
    actor.setScale(scale[0] ?? 1, scale[1] ?? 1, z_scale);
  }
  renderer.resetCamera();
  const renderWindow = genericRenderWindow.value!.getRenderWindow();
  renderWindow.render();
  const viewerStore = useViewerStore();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.set_z_scaling;
  const params = {
    z_scale,
  };
  await viewerStore.request({
    schema,
    params,
  });
  await remoteRender();
}
function performClear(): void {
  const { genericRenderWindow, hybridDb } =
    useHybridViewerStore() as unknown as HybridViewerStorePublic;
  const renderer = genericRenderWindow.value!.getRenderer();
  for (const actor of renderer.getActors()) {
    renderer.removeActor(actor);
  }
  const renderWindow = genericRenderWindow.value!.getRenderWindow();
  renderWindow.render();
  for (const id of Object.keys(hybridDb)) {
    delete hybridDb[id];
  }
}
function useHybridViewerScene() {
  const hybridDb = reactive<HybridDb>({});
  const zScale = ref(1);
  async function addItem(id: string): Promise<void> {
    await performAddItem(id);
  }
  function removeItem(id: string): void {
    performRemoveItem(id);
  }
  function setVisibility(id: string, visibility: boolean): void {
    performSetVisibility(id, visibility);
  }
  async function setZScaling(z_scale: number): Promise<void> {
    await performSetZScaling(z_scale);
  }
  function clear(): void {
    performClear();
  }
  return {
    hybridDb,
    zScale,
    addItem,
    removeItem,
    setVisibility,
    setZScaling,
    clear,
  };
}
export {
  performAddItem,
  performClear,
  performRemoveItem,
  performSetVisibility,
  performSetZScaling,
  useHybridViewerScene,
};
