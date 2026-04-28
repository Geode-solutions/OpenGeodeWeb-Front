import {
  applyCameraOptions,
  computeAverageBrightness,
  getCameraOptions,
} from "@ogw_front/utils/hybrid_viewer";
import { newInstance as vtkActor } from "@kitware/vtk.js/Rendering/Core/Actor";
import { newInstance as vtkGenericRenderWindow } from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";
import { newInstance as vtkMapper } from "@kitware/vtk.js/Rendering/Core/Mapper";
import { newInstance as vtkXMLPolyDataReader } from "@kitware/vtk.js/IO/XML/XMLPolyDataReader";

import { ACTOR_COLOR, BACKGROUND_COLOR, WHEEL_TIME_OUT_MS } from "@ogw_front/utils/vtk/constants";
import { ORIENTATIONS } from "@ogw_front/utils/vtk/camera";
import { Status } from "@ogw_front/utils/status";
import { useDataStore } from "@ogw_front/stores/data";
import { useViewerStore } from "@ogw_front/stores/viewer";

import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

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
  let imageStyle = undefined;
  const gridActor = undefined;

  const latestImage = ref(undefined);
  const offscreenCanvas =
    typeof document === "undefined" ? undefined : document.createElement("canvas");
  const offscreenCtx = offscreenCanvas
    ? offscreenCanvas.getContext("2d", { willReadFrequently: true })
    : undefined;

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
    imageStyle = webGLRenderWindow.getReferenceByName("bgImage").style;
    imageStyle.transition = "opacity 0.1s ease-in";
    imageStyle.zIndex = 1;

    await viewerStore.ws_connect();
    viewStream = viewerStore.client.getImageStream().createViewStream("-1");
    viewStream.onImageReady((event) => {
      if (is_moving.value) {
        return;
      }
      latestImage.value = event.image;
      webGLRenderWindow.setBackgroundImage(event.image);
      imageStyle.opacity = 1;
    });

    const renderer = genericRenderWindow.value.getRenderer();
    const camera = renderer.getActiveCamera();
    camera.onModified(() => {
      Object.assign(camera_options, getCameraOptions(camera));
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
    const config = ORIENTATIONS[orientation.toLowerCase()];
    const renderer = genericRenderWindow.value.getRenderer();
    const camera = renderer.getActiveCamera();
    const startState = getCameraOptions(camera);

    applyCameraOptions(camera, {
      ...config,
      focal_point: [0, 0, 0],
    });
    renderer.resetCamera();
    const targetState = getCameraOptions(camera);

    applyCameraOptions(camera, startState);

    const duration = 500;
    const startTime = performance.now();
    is_moving.value = true;
    imageStyle.opacity = 0;

    function animate(currentTime) {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const ease = progress * (2 - progress);

      camera.set({
        position: startState.position.map(
          (startValue, index) => startValue + (targetState.position[index] - startValue) * ease,
        ),
        viewUp: startState.view_up.map(
          (startValue, index) => startValue + (targetState.view_up[index] - startValue) * ease,
        ),
        focalPoint: startState.focal_point.map(
          (startValue, index) => startValue + (targetState.focal_point[index] - startValue) * ease,
        ),
      });

      genericRenderWindow.value.getRenderWindow().render();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        is_moving.value = false;
        syncRemoteCamera();
      }
    }
    requestAnimationFrame(animate);
  }

  function syncRemoteCamera() {
    const renderer = genericRenderWindow.value.getRenderer();
    const camera = renderer.getActiveCamera();
    const params = { camera_options: getCameraOptions(camera) };
    viewerStore.request(viewer_schemas.opengeodeweb_viewer.viewer.update_camera, params, {
      response_function: () => {
        remoteRender();
        Object.assign(camera_options, params.camera_options);
      },
    });
  }

  function remoteRender() {
    return viewerStore.request(viewer_schemas.opengeodeweb_viewer.viewer.render);
  }

  function setContainer(container) {
    genericRenderWindow.value.setContainer(container.value.$el);
    const webGLRenderWindow = genericRenderWindow.value.getApiSpecificRenderWindow();
    webGLRenderWindow.setUseBackgroundImage(true);
    imageStyle = webGLRenderWindow.getReferenceByName("bgImage").style;
    imageStyle.transition = "opacity 0.1s ease-in";
    imageStyle.zIndex = 1;
    resize(container.value.$el.offsetWidth, container.value.$el.offsetHeight);

    useMousePressed({
      target: container,
      onPressed: (event) => {
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

  function getAverageBrightness(rect) {
    return computeAverageBrightness(rect, {
      latestImage: latestImage.value,
      offscreenCtx,
      offscreenCanvas,
      genericRenderWindow: genericRenderWindow.value,
    });
  }

  function exportStores() {
    const renderer = genericRenderWindow.value.getRenderer();
    const camera = renderer.getActiveCamera();
    const cameraSnapshot = getCameraOptions(camera) || camera_options;
    return { zScale: zScale.value, camera_options: cameraSnapshot };
  }

  async function importStores(snapshot) {
    if (!snapshot) {
      return;
    }
    const z_scale = snapshot.zScale;
    if (typeof z_scale === "number") {
      await setZScaling(z_scale);
    }

    const { camera_options: snapshot_camera_options } = snapshot;
    if (snapshot_camera_options) {
      const renderer = genericRenderWindow.value.getRenderer();
      applyCameraOptions(renderer.getActiveCamera(), snapshot_camera_options);
      genericRenderWindow.value.getRenderWindow().render();
      syncRemoteCamera();
    }
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
    camera_options,
    latestImage,
    getAverageBrightness,
  };
});
