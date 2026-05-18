import {
  ACTOR_COLOR,
  BACKGROUND_COLOR,
  HOVER_THROTTLE_MS,
  WHEEL_TIME_OUT_MS,
  computeAverageBrightness,
  performAddItem,
  performClearHoverHighlight,
  performClickPicking,
  performHoverHighlight,
  performSetContainer,
  performSetZScaling,
} from "@ogw_internal/stores/hybrid_viewer";
import {
  applySnapshot,
  getCameraOptions,
  performCameraOrientation,
  performFocusCameraOnObject,
  performSetCamera,
  performSyncRemoteCamera,
} from "@ogw_internal/stores/hybrid_viewer_camera";
import { newInstance as vtkActor } from "@kitware/vtk.js/Rendering/Core/Actor";
import { newInstance as vtkGenericRenderWindow } from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";
import { newInstance as vtkMapper } from "@kitware/vtk.js/Rendering/Core/Mapper";
import { newInstance as vtkXMLPolyDataReader } from "@kitware/vtk.js/IO/XML/XMLPolyDataReader";

import { Status } from "@ogw_front/utils/status";
import { useDataStore } from "@ogw_front/stores/data";
import { useViewerStore } from "@ogw_front/stores/viewer";
import { database } from "@ogw_internal/database/database.js";

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
  const hoverData = ref(null);
  const hoverPosition = ref({ x: 0, y: 0 });
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
    await performSetZScaling(z_scale, {
      zScale,
      genericRenderWindow: genericRenderWindow.value,
      gridActor,
      viewerStore,
      viewer_schemas,
      remoteRender,
    });
  }

  function resetCamera() {
    genericRenderWindow.value.getRenderer().resetCamera();
    genericRenderWindow.value.getRenderWindow().render();
    syncRemoteCamera();
  }

  async function focusCameraOnObject(id, block_ids = []) {
    await performFocusCameraOnObject(id, {
      hybridDb,
      viewerStore,
      viewer_schemas,
      genericRenderWindow: genericRenderWindow.value,
      block_ids,
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

  function setCamera(targetCameraOptions) {
    performSetCamera(targetCameraOptions, {
      genericRenderWindow: genericRenderWindow.value,
      is_moving,
      imageStyle,
      syncRemoteCamera,
    });
  }

  function syncRemoteCamera() {
    performSyncRemoteCamera({
      genericRenderWindow: genericRenderWindow.value,
      viewerStore,
      viewer_schemas,
      remoteRender,
      camera_options,
    });
  }

  function remoteRender() {
    return viewerStore.request(viewer_schemas.opengeodeweb_viewer.viewer.render);
  }

  const throttledHoverHighlight = useThrottleFn((event) => {
    hoverPosition.value = { x: event.clientX, y: event.clientY };
    performHoverHighlight(event, {
      is_hover_highlight,
      genericRenderWindow: genericRenderWindow.value,
      viewerStore,
      viewer_schemas,
      hover_highlight_field_type,
      hybridDb,
      onResponse: async (response) => {
        if (!is_hover_highlight.value) {
          hoverData.value = null;
          return;
        }
        if (
          response &&
          response.id &&
          response.picked_id !== undefined &&
          response.picked_id !== -1
        ) {
          let componentInfo = null;
          if (response.geode_id) {
            const component = await database.model_components
              .where("[id+geode_id]")
              .equals([response.id, response.geode_id])
              .first();
            if (component) {
              componentInfo = {
                name: component.name,
                id: component.geode_id,
                type: component.type,
              };
            }
          }
          hoverData.value = {
            modelId: response.id,
            pickedId: response.picked_id,
            fieldType: response.field_type,
            component: componentInfo,
            attributes: response.attributes || {},
          };
        } else {
          hoverData.value = null;
        }
      },
    });
  }, HOVER_THROTTLE_MS);

  function clearHoverHighlight() {
    hoverData.value = null;
    performClearHoverHighlight({
      viewerStore,
      viewer_schemas,
      hover_highlight_field_type,
      hybridDb,
    });
  }

  function setContainer(container) {
    performSetContainer({
      container,
      genericRenderWindow: genericRenderWindow.value,
      imageStyleSetter: (style) => (imageStyle = style),
      resize,
      useMousePressed,
      useEventListener,
      is_picking,
      is_moving,
      clickPickingCallback: performClickPicking,
      viewerStore,
      viewer_schemas,
      syncRemoteCamera,
      throttledHoverHighlight,
      wheelTimeoutMs: WHEEL_TIME_OUT_MS,
      wheelEventEndTimeout,
      wheelTimeoutSetter: (timeout) => (wheelEventEndTimeout = timeout),
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
    focusCameraOnObject,
    setCameraOrientation,
    setContainer,
    zScale,
    is_picking,
    is_hover_highlight,
    hover_highlight_field_type,
    clearHoverHighlight,
    hoverData,
    hoverPosition,
    clear,
    exportStores,
    importStores,
    camera_options,
    latestImage,
    getAverageBrightness,
  };
});
