import {
  ACTOR_COLOR,
  BACKGROUND_COLOR,
  WHEEL_TIME_OUT_MS,
  applySnapshot,
  computeAverageBrightness,
  getCameraOptions,
  performCameraOrientation,
  performClickPicking,
  performSetCamera,
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
  const hybridDb = reactive({});
  const viewerStore = useViewerStore();
  const camera_options = reactive({});
  const genericRenderWindow = reactive({});
  const status = ref(Status.NOT_CREATED);
  const is_moving = ref(false);
  const is_picking = ref(false);
  const is_hover_highlight = ref(false);
  const hover_highlight_field_type = ref("CELL");
  const zScale = ref(1);
  let imageStyle = undefined;
  let viewStream = undefined;
  let wheelEventEndTimeout = undefined;
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
    Object.assign(imageStyle, { transition: "opacity 0.1s ease-in", zIndex: 1 });
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
    const camera = genericRenderWindow.value.getRenderer().getActiveCamera();
    Object.assign(camera_options, getCameraOptions(camera));
    camera.onModified(() => {
      Object.assign(camera_options, getCameraOptions(camera));
    });
    status.value = Status.CREATED;
  }

  async function addItem(id) {
    if (!genericRenderWindow.value) {
      return;
    }
    const reader = vtkXMLPolyDataReader();
    const value = await dataStore.item(id);
    await reader.parseAsArrayBuffer(new TextEncoder().encode(value.binary_light_viewable));
    const actor = vtkActor();
    const mapper = vtkMapper();
    const polydata = reader.getOutputData(0);
    mapper.setInputData(polydata);
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
    genericRenderWindow.value.getRenderer().removeActor(hybridDb[id].actor);
    genericRenderWindow.value.getRenderWindow().render();
    delete hybridDb[id];
  }

  function setVisibility(id, visibility) {
    if (!hybridDb[id]) {
      return;
    }
    hybridDb[id].actor.setVisibility(visibility);
    genericRenderWindow.value.getRenderWindow().render();
  }

  async function setZScaling(z_scale) {
    zScale.value = z_scale;
    const renderer = genericRenderWindow.value.getRenderer();
    for (const actor of renderer.getActors()) {
      if (actor !== gridActor) {
        const scale = actor.getScale();
        actor.setScale(scale[0], scale[1], z_scale);
      }
    }
    renderer.resetCamera();
    genericRenderWindow.value.getRenderWindow().render();
    const schema = viewer_schemas?.opengeodeweb_viewer?.viewer?.set_z_scaling;
    if (schema) {
      await viewerStore.request(schema, { z_scale });
    }
    remoteRender();
  }

  function resetCamera() {
    genericRenderWindow.value.getRenderer().resetCamera();
    genericRenderWindow.value.getRenderWindow().render();
    syncRemoteCamera();
  }

  function setCamera(new_camera_options) {
    performSetCamera(new_camera_options, {
      genericRenderWindow: genericRenderWindow.value,
      is_moving,
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
    });
  }

  function syncRemoteCamera() {
    const camera = genericRenderWindow.value.getRenderer().getActiveCamera();
    const options = getCameraOptions(camera);
    viewerStore.request(
      viewer_schemas.opengeodeweb_viewer.viewer.update_camera,
      { camera_options: options },
      {
        response_function: () => {
          remoteRender();
          Object.assign(camera_options, options);
        },
      },
    );
  }

  function remoteRender() {
    return viewerStore.request(viewer_schemas.opengeodeweb_viewer.viewer.render);
  }

  const performHoverHighlight = useThrottleFn((event) => {
    if (!is_hover_highlight.value) {
      return;
    }
    const container = genericRenderWindow.value.getContainer();
    if (!container) {
      return;
    }
    const rect = container.getBoundingClientRect();
    viewerStore.request(viewer_schemas.opengeodeweb_viewer.viewer.hover_highlight, {
      x: Math.round(event.clientX - rect.left),
      y: Math.round(rect.height - (event.clientY - rect.top)),
      field_type: hover_highlight_field_type.value,
      ids: Object.keys(hybridDb),
    });
  }, 50);

  function clearHoverHighlight() {
    viewerStore.request(viewer_schemas.opengeodeweb_viewer.viewer.hover_highlight, {
      x: -1,
      y: -1,
      field_type: hover_highlight_field_type.value,
      ids: Object.keys(hybridDb),
    });
  }

  function setContainer(container) {
    if (!container.value) {
      return;
    }
    genericRenderWindow.value.setContainer(container.value.$el);
    const webGLRenderWindow = genericRenderWindow.value.getApiSpecificRenderWindow();
    webGLRenderWindow.setUseBackgroundImage(true);
    imageStyle = webGLRenderWindow.getReferenceByName("bgImage").style;
    Object.assign(imageStyle, { transition: "opacity 0.1s ease-in", zIndex: 1 });
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
        if (is_moving.value) {
          is_moving.value = false;
          syncRemoteCamera();
        }
      },
    });
    useEventListener(container, "mousemove", performHoverHighlight);
    useEventListener(container, "wheel", () => {
      is_moving.value = true;
      if (imageStyle) {
        imageStyle.opacity = 0;
      }
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
    genericRenderWindow.value.getRenderWindow().render();
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
    const camera = genericRenderWindow.value.getRenderer().getActiveCamera();
    return { zScale: zScale.value, camera_options: getCameraOptions(camera) || camera_options };
  }

  async function importStores(snapshot) {
    await applySnapshot(snapshot, {
      genericRenderWindow: genericRenderWindow.value,
      setZScaling,
      syncRemoteCamera,
      setCamera,
    });
  }

  function clear() {
    const renderer = genericRenderWindow.value.getRenderer();
    for (const actor of renderer.getActors()) {
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
    setCamera,
    initHybridViewer,
    remoteRender,
    resize,
    resetCamera,
    setCameraOrientation,
    setContainer,
    zScale,
    is_picking,
    is_hover_highlight,
    hover_highlight_field_type,
    clearHoverHighlight,
    clear,
    exportStores,
    importStores,
    camera_options,
    latestImage,
    getAverageBrightness,
  };
});
