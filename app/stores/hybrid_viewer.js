import {
  ACTOR_COLOR,
  ALIGNMENT_THRESHOLD,
  BACKGROUND_COLOR,
  BUMP_MULTIPLIER,
  EASE_EXPONENT,
  LONG_ANIMATION_DURATION,
  SHORT_ANIMATION_DURATION,
  WHEEL_TIME_OUT_MS,
  applySnapshot,
  computeAverageBrightness,
  focusCameraOnBounds,
  getCameraOptions,
  performCameraOrientation,
  performClickPicking,
} from "@ogw_internal/stores/hybrid_viewer";
import { newInstance as vtkActor } from "@kitware/vtk.js/Rendering/Core/Actor";
import { newInstance as vtkGenericRenderWindow } from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";
import { newInstance as vtkMapper } from "@kitware/vtk.js/Rendering/Core/Mapper";
import { newInstance as vtkXMLPolyDataReader } from "@kitware/vtk.js/IO/XML/XMLPolyDataReader";

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
  const is_picking = ref(false);
  const zScale = ref(1);
  let viewStream = undefined;
  let imageStyle = undefined;
  const gridActor = undefined;

  watch(is_picking, (value) => {
    const element = genericRenderWindow.value
      ?.getApiSpecificRenderWindow()
      ?.getCanvas()?.parentElement;
    if (element) {
      element.style.cursor = value ? "crosshair" : "default";
    }
  });

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

  function focusCameraOnObject(id) {
    if (!hybridDb[id]) {
      return;
    }
    const bounds = hybridDb[id].actor.getBounds();
    focusCameraOnBounds(bounds, {
      genericRenderWindow: genericRenderWindow.value,
      imageStyle,
      syncRemoteCamera,
    });
  }

  function setCameraOrientation(orientation) {
    performCameraOrientation(orientation, {
      genericRenderWindow: genericRenderWindow.value,
      is_moving,
      imageStyle,
      syncRemoteCamera,
      constants: {
        ALIGNMENT_THRESHOLD,
        BUMP_MULTIPLIER,
        EASE_EXPONENT,
        LONG_ANIMATION_DURATION,
        SHORT_ANIMATION_DURATION,
      },
    });
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
    if (!container.value) {
      return;
    }
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
        if (event.button !== 0) {
          return;
        }
        if (is_picking.value) {
          performClickPicking(event, {
            container: container.value.$el,
            viewerStore,
            viewer_schemas,
            genericRenderWindow: genericRenderWindow.value,
            syncRemoteCamera,
          });
          is_picking.value = false;
          return;
        }
        is_moving.value = true;
        event.stopPropagation();
        imageStyle.opacity = 0;
      },
      onReleased: () => {
        if (!is_moving.value) {
          return;
        }
        is_moving.value = false;
        genericRenderWindow.value.getRenderer().resetCameraClippingRange();
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
        genericRenderWindow.value.getRenderer().resetCameraClippingRange();
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
    await applySnapshot(snapshot, {
      genericRenderWindow: genericRenderWindow.value,
      setZScaling,
      syncRemoteCamera,
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
    initHybridViewer,
    remoteRender,
    resize,
    resetCamera,
    focusCameraOnObject,
    setCameraOrientation,
    setContainer,
    zScale,
    is_picking,
    clear,
    exportStores,
    importStores,
    camera_options,
    latestImage,
    getAverageBrightness,
  };
});
