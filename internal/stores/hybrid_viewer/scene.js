import { ACTOR_COLOR } from "./constants";
import { useDataStore } from "@ogw_front/stores/data";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";
import { newInstance as vtkActor } from "@kitware/vtk.js/Rendering/Core/Actor";
import { newInstance as vtkMapper } from "@kitware/vtk.js/Rendering/Core/Mapper";
import { newInstance as vtkXMLPolyDataReader } from "@kitware/vtk.js/IO/XML/XMLPolyDataReader";

function useHybridViewerScene() {
  const hybridDb = reactive({});
  const zScale = ref(1);

  async function addItem(id) {
    await performAddItem(id);
  }

  function removeItem(id) {
    performRemoveItem(id);
  }

  function setVisibility(id, visibility) {
    performSetVisibility(id, visibility);
  }

  async function setZScaling(z_scale) {
    await performSetZScaling(z_scale);
  }

  function clear() {
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

async function performAddItem(id) {
  const { genericRenderWindow, hybridDb } = useHybridViewerStore();
  if (!genericRenderWindow.value) {
    return;
  }
  const dataStore = useDataStore();
  const value = await dataStore.item(id);
  if (value && !dataStore.isItemViewable(value)) {
    return;
  }

  const reader = vtkXMLPolyDataReader();
  await reader.parseAsArrayBuffer(new TextEncoder().encode(value.binary_light_viewable));
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
  hybridDb[id] = { actor, polydata, mapper };
}

function performRemoveItem(id) {
  const { genericRenderWindow, hybridDb } = useHybridViewerStore();
  if (!hybridDb[id]) {
    return;
  }
  const renderer = genericRenderWindow.value.getRenderer();
  renderer.removeActor(hybridDb[id].actor);
  const renderWindow = genericRenderWindow.value.getRenderWindow();
  renderWindow.render();
  delete hybridDb[id];
}

function performSetVisibility(id, visibility) {
  const { genericRenderWindow, hybridDb } = useHybridViewerStore();
  if (!hybridDb[id]) {
    return;
  }
  hybridDb[id].actor.setVisibility(visibility);
  const renderWindow = genericRenderWindow.value.getRenderWindow();
  renderWindow.render();
}

async function performSetZScaling(z_scale) {
  const { genericRenderWindow, zScale, remoteRender } = useHybridViewerStore();
  if (zScale) {
    zScale.value = z_scale;
  }
  const renderer = genericRenderWindow.value.getRenderer();
  for (const actor of renderer.getActors()) {
    const scale = actor.getScale();
    actor.setScale(scale[0], scale[1], z_scale);
  }
  renderer.resetCamera();
  const renderWindow = genericRenderWindow.value.getRenderWindow();
  renderWindow.render();
  const viewerStore = useViewerStore();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.set_z_scaling;
  const params = { z_scale };
  await viewerStore.request({ schema, params });
  await remoteRender();
}

function performClear() {
  const { genericRenderWindow, hybridDb } = useHybridViewerStore();
  const renderer = genericRenderWindow.value.getRenderer();
  for (const actor of renderer.getActors()) {
    renderer.removeActor(actor);
  }
  const renderWindow = genericRenderWindow.value.getRenderWindow();
  renderWindow.render();
  if (hybridDb) {
    for (const id of Object.keys(hybridDb)) {
      delete hybridDb[id];
    }
  }
}

export {
  performAddItem,
  performClear,
  performRemoveItem,
  performSetVisibility,
  performSetZScaling,
  useHybridViewerScene,
};
