import {
  applySnapshot,
  getCameraOptions,
  useHybridViewerCamera,
} from "@ogw_internal/stores/hybrid_viewer/camera";
import { BACKGROUND_COLOR } from "@ogw_internal/stores/hybrid_viewer/constants";
import { useHybridViewerBrightness } from "@ogw_internal/stores/hybrid_viewer/brightness";
import { useHybridViewerFilters } from "@ogw_internal/stores/hybrid_viewer/filters";
import { useHybridViewerHighlight } from "@ogw_internal/stores/hybrid_viewer/highlight";
import { useHybridViewerRuler } from "@ogw_internal/stores/hybrid_viewer/ruler";
import { useHybridViewerScene } from "@ogw_internal/stores/hybrid_viewer/scene";
import { useHybridViewerViewport } from "@ogw_internal/stores/hybrid_viewer/viewport";
import { newInstance as vtkGenericRenderWindow } from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";

import { Status } from "@ogw_front/utils/status";
import { useViewerStore } from "@ogw_front/stores/viewer";

import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

// oxlint-disable max-lines-per-function, max-statements
export const useHybridViewerStore = defineStore("hybridViewer", () => {
  const viewerStore = useViewerStore();
  const genericRenderWindow = reactive({});
  const status = ref(Status.NOT_CREATED);
  const is_moving = ref(false);
  const is_picking = ref(false);
  let imageStyle = undefined;

  const brightnessStore = useHybridViewerBrightness();
  const sceneStore = useHybridViewerScene();
  const filtersStore = useHybridViewerFilters();
  const highlightStore = useHybridViewerHighlight();
  const rulerStore = useHybridViewerRuler();
  const cameraStore = useHybridViewerCamera();
  const viewportStore = useHybridViewerViewport();

  const is_cursor_crosshair = computed(() => is_picking.value || rulerStore.is_ruler_active.value);

  watch(is_cursor_crosshair, (value) => {
    if (!genericRenderWindow.value) {
      return;
    }
    const webGLRenderWindow = genericRenderWindow.value.getApiSpecificRenderWindow();
    const canvas = webGLRenderWindow.getCanvas();
    if (canvas && canvas.parentElement) {
      canvas.parentElement.style.cursor = value ? "crosshair" : "default";
    }
  });

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
    const imageStream = viewerStore.client.getImageStream();
    viewportStore.viewStream.value = imageStream.createViewStream("-1");
    viewportStore.viewStream.value.onImageReady((event) => {
      if (is_moving.value) {
        return;
      }
      brightnessStore.latestImage.value = event.image;
      webGLRenderWindow.setBackgroundImage(event.image);
      imageStyle.opacity = 1;
    });
    const renderer = genericRenderWindow.value.getRenderer();
    const camera = renderer.getActiveCamera();
    Object.assign(cameraStore.camera_options, getCameraOptions(camera));
    camera.onModified(() => {
      Object.assign(cameraStore.camera_options, getCameraOptions(camera));
    });
    status.value = Status.CREATED;
  }

  let renderPromise = undefined;
  let renderPending = false;

  function remoteRender() {
    if (renderPromise) {
      renderPending = true;
      return renderPromise;
    }

    renderPromise = (async () => {
      try {
        const schema = viewer_schemas.opengeodeweb_viewer.viewer.render;
        await viewerStore.request({ schema });
      } finally {
        renderPromise = undefined;
        if (renderPending) {
          renderPending = false;
          await remoteRender();
        }
      }
    })();
    return renderPromise;
  }

  function exportStores() {
    const renderer = genericRenderWindow.value.getRenderer();
    const camera = renderer.getActiveCamera();
    return {
      zScale: sceneStore.zScale.value,
      camera_options: getCameraOptions(camera) || cameraStore.camera_options,
    };
  }

  return {
    genericRenderWindow,
    status,
    is_moving,
    is_picking,
    initHybridViewer,
    remoteRender,
    exportStores,
    importStores: applySnapshot,
    ...brightnessStore,
    ...sceneStore,
    ...viewportStore,
    ...filtersStore,
    ...highlightStore,
    ...rulerStore,
    ...cameraStore,
  };
});
