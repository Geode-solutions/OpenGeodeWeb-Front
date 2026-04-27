// oxlint-disable-next-line import/no-unassigned-import
import "@kitware/vtk.js/Rendering/Profiles/Geometry";
import { newInstance as vtkActor } from "@kitware/vtk.js/Rendering/Core/Actor";
import { newInstance as vtkGenericRenderWindow } from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";
import { newInstance as vtkMapper } from "@kitware/vtk.js/Rendering/Core/Mapper";
import { newInstance as vtkXMLPolyDataReader } from "@kitware/vtk.js/IO/XML/XMLPolyDataReader";

import { Status } from "@ogw_front/utils/status";
import { useDataStore } from "@ogw_front/stores/data";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const RGB_MAX = 255;
const BACKGROUND_GREY_VALUE = 180;
const ACTOR_DARK_VALUE = 20;
const BACKGROUND_COLOR = [
  BACKGROUND_GREY_VALUE / RGB_MAX,
  BACKGROUND_GREY_VALUE / RGB_MAX,
  BACKGROUND_GREY_VALUE / RGB_MAX,
];
const ACTOR_COLOR = [
  ACTOR_DARK_VALUE / RGB_MAX,
  ACTOR_DARK_VALUE / RGB_MAX,
  ACTOR_DARK_VALUE / RGB_MAX,
];
const WHEEL_TIME_OUT_MS = 600;

const ORIENTATIONS = {
  top: { direction: [0, 0, 1], viewUp: [0, 1, 0] },
  bottom: { direction: [0, 0, -1], viewUp: [0, 1, 0] },
  north: { direction: [0, 1, 0], viewUp: [0, 0, 1] },
  south: { direction: [0, -1, 0], viewUp: [0, 0, 1] },
  east: { direction: [1, 0, 0], viewUp: [0, 0, 1] },
  west: { direction: [-1, 0, 0], viewUp: [0, 0, 1] },
};

function getCameraState(camera) {
  return {
    focal_point: [...camera.getFocalPoint()],
    view_up: [...camera.getViewUp()],
    position: [...camera.getPosition()],
    view_angle: camera.getViewAngle(),
    clipping_range: [...camera.getClippingRange()],
    distance: camera.getDistance(),
  };
}

function setCameraState(camera, state) {
  if (!state) {
    return;
  }
  camera.set({
    focalPoint: state.focal_point,
    viewUp: state.view_up,
    position: state.position,
    viewAngle: state.view_angle,
    clippingRange: state.clipping_range,
  });
}

export const useHybridViewerStore = defineStore("hybridViewer", () => {
  const dataStore = useDataStore();
  const viewerStore = useViewerStore();
  const hybridDb = reactive({});
  const status = ref(Status.NOT_CREATED);
  const camera_options = reactive({});
  const genericRenderWindow = reactive({});
  const is_moving = ref(false);
  const zScale = ref(1);
  let viewStream = undefined;
  const gridActor = undefined;

  async function initHybridViewer() {
    if (status.value !== Status.NOT_CREATED) {
      return;
    }
    status.value = Status.CREATING;
    genericRenderWindow.value = vtkGenericRenderWindow({
      background: BACKGROUND_COLOR,
      listenWindowResize: false,
    });

    const webGLRenderWindow = genericRenderWindow.value.getApiSpecificRenderWindow();
    const imageStyle = webGLRenderWindow.getReferenceByName("bgImage").style;
    imageStyle.transition = "opacity 0.1s ease-in";
    imageStyle.zIndex = 1;

    await viewerStore.ws_connect();
    viewStream = viewerStore.client.getImageStream().createViewStream("-1");
    viewStream.onImageReady((event) => {
      if (is_moving.value) {
        return;
      }
      webGLRenderWindow.setBackgroundImage(event.image);
      imageStyle.opacity = 1;
    });

    status.value = Status.CREATED;
  }

  async function addItem(id) {
    if (!genericRenderWindow.value) {
      return;
    }
    const value = await dataStore.item(id);
    const reader = vtkXMLPolyDataReader();
    const textEncoder = new TextEncoder();
    await reader.parseAsArrayBuffer(textEncoder.encode(value.binary_light_viewable));
    const polydata = reader.getOutputData(0);
    const mapper = vtkMapper();
    mapper.setInputData(polydata);
    const actor = vtkActor();
    actor.getProperty().setColor(ACTOR_COLOR);
    actor.setMapper(mapper);
    const renderer = genericRenderWindow.value.getRenderer();
    const isFirst = renderer.getActors().length === 0;
    renderer.addActor(actor);
    if (isFirst) {
      renderer.resetCamera();
    }
    hybridDb[id] = { actor, polydata, mapper };
  }

  function removeItem(id) {
    if (!hybridDb[id]) {
      return;
    }
    const renderer = genericRenderWindow.value.getRenderer();
    renderer.removeActor(hybridDb[id].actor);
    genericRenderWindow.value.getRenderWindow().render();
    delete hybridDb[id];
  }

  function setVisibility(id, visibility) {
    if (!hybridDb[id]) {
      return;
    }
    hybridDb[id].actor.setVisibility(visibility);
    const renderWindow = genericRenderWindow.value.getRenderWindow();
    renderWindow.render();
  }
  async function setZScaling(z_scale) {
    zScale.value = z_scale;
    const renderer = genericRenderWindow.value.getRenderer();
    const actors = renderer.getActors();
    for (const actor of actors) {
      if (actor !== gridActor) {
        const scale = actor.getScale();
        actor.setScale(scale[0], scale[1], z_scale);
      }
    }
    renderer.resetCamera();
    genericRenderWindow.value.getRenderWindow().render();
    const schema = viewer_schemas?.opengeodeweb_viewer?.viewer?.set_z_scaling;
    if (!schema) {
      return;
    }
    await viewerStore.request(schema, {
      z_scale,
    });
    remoteRender();
  }

  function resetCamera() {
    const renderer = genericRenderWindow.value.getRenderer();
    renderer.resetCamera();
    genericRenderWindow.value.getRenderWindow().render();
    syncRemoteCamera();
  }

  function setCameraOrientation(orientation) {
    const config = ORIENTATIONS[orientation];
    if (!config) {
      return;
    }
    const renderer = genericRenderWindow.value.getRenderer();
    renderer.getActiveCamera().set({
      position: config.direction,
      viewUp: config.viewUp,
      focalPoint: [0, 0, 0],
    });
    renderer.resetCamera();
    genericRenderWindow.value.getRenderWindow().render();
    syncRemoteCamera();
  }

  function syncRemoteCamera() {
    const renderer = genericRenderWindow.value.getRenderer();
    const camera = renderer.getActiveCamera();
    const params = { camera_options: getCameraState(camera) };
    viewerStore.request(viewer_schemas.opengeodeweb_viewer.viewer.update_camera, params, {
      response_function: () => {
        remoteRender();
        Object.assign(camera_options, params.camera_options);
      },
    });
  }

  function updateLocalCamera(snapshot_camera_options) {
    if (!snapshot_camera_options) {
      return;
    }
    const renderer = genericRenderWindow.value.getRenderer();
    setCameraState(renderer.getActiveCamera(), snapshot_camera_options);
    genericRenderWindow.value.getRenderWindow().render();
    Object.assign(camera_options, snapshot_camera_options);
  }

  function remoteRender() {
    return viewerStore.request(viewer_schemas.opengeodeweb_viewer.viewer.render);
  }

  function setContainer(container) {
    genericRenderWindow.value.setContainer(container.value.$el);
    const webGLRenderWindow = genericRenderWindow.value.getApiSpecificRenderWindow();
    webGLRenderWindow.setUseBackgroundImage(true);
    const imageStyle = webGLRenderWindow.getReferenceByName("bgImage").style;
    imageStyle.transition = "opacity 0.1s ease-in";
    imageStyle.zIndex = 1;
    resize(container.value.$el.offsetWidth, container.value.$el.offsetHeight);
    console.log("setContainer", container.value.$el);

    useMousePressed({
      target: container,
      onPressed: (event) => {
        console.log("onPressed");
        if (event.button === 0) {
          is_moving.value = true;
          event.stopPropagation();
          imageStyle.opacity = 0;
        }
      },
      onReleased: () => {
        if (!is_moving.value) {
          return;
        }
        is_moving.value = false;
        console.log("onReleased");
        syncRemoteCamera();
      },
    });

    let wheelEventEndTimeout = undefined;
    useEventListener(container, "wheel", () => {
      is_moving.value = true;
      imageStyle.opacity = 0;
      clearTimeout(wheelEventEndTimeout);
      wheelEventEndTimeout = setTimeout(() => {
        is_moving.value = false;
        syncRemoteCamera();
      }, WHEEL_TIME_OUT_MS);
    });
  }

  async function resize(width, height) {
    if (viewerStore.status !== Status.CONNECTED || status.value !== Status.CREATED) {
      return;
    }
    const webGLRenderWindow = genericRenderWindow.value.getApiSpecificRenderWindow();
    const canvas = webGLRenderWindow.getCanvas();
    canvas.width = width;
    canvas.height = height;
    await nextTick();
    webGLRenderWindow.setSize(width, height);
    viewStream.setSize(width, height);
    const renderWindow = genericRenderWindow.value.getRenderWindow();
    renderWindow.render();
    remoteRender();
  }

  function exportStores() {
    const renderer = genericRenderWindow.value.getRenderer();
    const camera = renderer.getActiveCamera();
    const cameraSnapshot = camera ? getCameraState(camera) : camera_options;
    return { zScale: zScale.value, camera_options: cameraSnapshot };
  }

  async function importStores(snapshot) {
    if (!snapshot) {
      console.warn("importStores called with undefined snapshot");
      return;
    }
    const z_scale = snapshot.zScale;
    if (typeof z_scale === "number") {
      await setZScaling(z_scale);
    }

    const { camera_options: snapshot_camera_options } = snapshot;
    if (!snapshot_camera_options) {
      return;
    }

    const renderer = genericRenderWindow.value.getRenderer();
    const camera = renderer.getActiveCamera();
    setCameraState(camera, snapshot_camera_options);
    genericRenderWindow.value.getRenderWindow().render();

    const payload = { camera_options: getCameraState(camera) };
    return viewerStore.request(viewer_schemas.opengeodeweb_viewer.viewer.update_camera, payload, {
      response_function: () => {
        remoteRender();
        Object.assign(camera_options, payload.camera_options);
      },
    });
  }

  function clear() {
    const renderer = genericRenderWindow.value.getRenderer();
    const actors = renderer.getActors();
    for (const actor of actors) {
      renderer.removeActor(actor);
    }
    genericRenderWindow.value.getRenderWindow().render();
    for (const id of Object.keys(hybridDb)) {
      delete hybridDb[id];
    }
  }

  return {
    hybridDb,
    genericRenderWindow,
    addItem,
    removeItem,
    setVisibility,
    setZScaling,
    syncRemoteCamera,
    updateLocalCamera,
    initHybridViewer,
    remoteRender,
    resize,
    resetCamera,
    setCameraOrientation,
    setContainer,
    zScale,
    clear,
    exportStores,
    importStores,
  };
});
