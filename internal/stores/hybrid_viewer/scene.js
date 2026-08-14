import { ACTOR_COLOR } from "./constants";
import { newInstance as vtkActor } from "@kitware/vtk.js/Rendering/Core/Actor";
import { newInstance as vtkMapper } from "@kitware/vtk.js/Rendering/Core/Mapper";
import { newInstance as vtkXMLPolyDataReader } from "@kitware/vtk.js/IO/XML/XMLPolyDataReader";

function useHybridViewerScene(options) {
  const { genericRenderWindow, viewerStore, viewer_schemas, remoteRender, dataStore, gridActor } =
    options;

  const hybridDb = reactive({});
  const zScale = ref(1);

  async function addItem(id) {
    await performAddItem(id, {
      genericRenderWindow: genericRenderWindow.value,
      dataStore,
      vtkXMLPolyDataReader,
      vtkActor,
      vtkMapper,
      actorColor: ACTOR_COLOR,
      hybridDb,
    });
  }

  function removeItem(id) {
    performRemoveItem(id, { genericRenderWindow: genericRenderWindow.value, hybridDb });
  }

  function setVisibility(id, visibility) {
    performSetVisibility(id, visibility, {
      genericRenderWindow: genericRenderWindow.value,
      hybridDb,
    });
  }

  async function setZScaling(z_scale) {
    await performSetZScaling(z_scale, {
      zScale,
      genericRenderWindow: genericRenderWindow.value,
      gridActor,
      viewerStore,
      viewer_schemas,
      remoteRender,
    });
  }

  function clear() {
    performClear({ genericRenderWindow: genericRenderWindow.value, hybridDb });
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

async function performAddItem(id, options) {
  const {
    genericRenderWindow,
    dataStore,
    vtkXMLPolyDataReader: vtkXMLPolyDataReaderOverride,
    vtkActor: vtkActorOverride,
    vtkMapper: vtkMapperOverride,
    actorColor,
    hybridDb,
  } = options;
  if (!genericRenderWindow) {
    return;
  }
  const value = await dataStore.item(id);
  if (value && !dataStore.isItemViewable(value)) {
    return;
  }
  const createReader = vtkXMLPolyDataReaderOverride || vtkXMLPolyDataReader;
  const createActor = vtkActorOverride || vtkActor;
  const createMapper = vtkMapperOverride || vtkMapper;

  const reader = createReader();
  await reader.parseAsArrayBuffer(new TextEncoder().encode(value.binary_light_viewable));
  const actor = createActor();
  const mapper = createMapper();
  const polydata = reader.getOutputData(0);
  mapper.setInputData(polydata);
  actor.getProperty().setColor(actorColor || ACTOR_COLOR);
  actor.setMapper(mapper);
  const renderer = genericRenderWindow.getRenderer();
  if (hybridDb[id] && hybridDb[id].actor) {
    renderer.removeActor(hybridDb[id].actor);
  }
  const isFirst = renderer.getActors().length === 0;
  renderer.addActor(actor);
  if (isFirst) {
    renderer.resetCamera();
  }
  hybridDb[id] = { actor, polydata, mapper };
}

function performRemoveItem(id, options) {
  const { genericRenderWindow, hybridDb } = options;
  if (!hybridDb[id]) {
    return;
  }
  genericRenderWindow.getRenderer().removeActor(hybridDb[id].actor);
  genericRenderWindow.getRenderWindow().render();
  delete hybridDb[id];
}

function performSetVisibility(id, visibility, options) {
  const { genericRenderWindow, hybridDb } = options;
  if (!hybridDb[id]) {
    return;
  }
  hybridDb[id].actor.setVisibility(visibility);
  genericRenderWindow.getRenderWindow().render();
}

async function performSetZScaling(z_scale, options) {
  const { zScale, genericRenderWindow, gridActor, viewerStore, viewer_schemas, remoteRender } =
    options;
  zScale.value = z_scale;
  const renderer = genericRenderWindow.getRenderer();
  for (const actor of renderer.getActors()) {
    if (actor !== gridActor) {
      const scale = actor.getScale();
      actor.setScale(scale[0], scale[1], z_scale);
    }
  }
  renderer.resetCamera();
  genericRenderWindow.getRenderWindow().render();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.set_z_scaling;
  const params = { z_scale };
  await viewerStore.request({ schema, params });
  remoteRender();
}

function performClear(options) {
  const { genericRenderWindow, hybridDb } = options;
  const renderer = genericRenderWindow.getRenderer();
  for (const actor of renderer.getActors()) {
    renderer.removeActor(actor);
  }
  genericRenderWindow.getRenderWindow().render();
  for (const id of Object.keys(hybridDb)) {
    delete hybridDb[id];
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
