import {
  type ViewStreamLike,
  useHybridViewerViewport,
} from "@ogw_internal/stores/hybrid_viewer/viewport";
import {
  applySnapshot,
  getCameraOptions,
  useHybridViewerCamera,
} from "@ogw_internal/stores/hybrid_viewer/camera";
import { BACKGROUND_COLOR } from "@ogw_internal/stores/hybrid_viewer/constants";
import type { CameraOptions } from "@ogw_internal/stores/hybrid_viewer/vtk_types";
import { useHybridViewerBrightness } from "@ogw_internal/stores/hybrid_viewer/brightness";
import { useHybridViewerCore } from "@ogw_internal/stores/hybrid_viewer/core";
import { useHybridViewerFilters } from "@ogw_internal/stores/hybrid_viewer/filters";
import { useHybridViewerHighlight } from "@ogw_internal/stores/hybrid_viewer/highlight";
import { useHybridViewerRuler } from "@ogw_internal/stores/hybrid_viewer/ruler";
import { useHybridViewerScene } from "@ogw_internal/stores/hybrid_viewer/scene";
import { newInstance as vtkGenericRenderWindow } from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";

import { Status } from "@ogw_front/utils/status";
import { useViewerStore } from "@ogw_front/stores/viewer";

// oxlint-disable max-lines-per-function, max-statements
export const useHybridViewerStore = defineStore("hybridViewer", () => {
  const viewerStore = useViewerStore();
  const { genericRenderWindow, status, is_moving, is_picking, remoteRender } =
    useHybridViewerCore();
  let imageStyle: CSSStyleDeclaration | undefined = undefined;

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
    // oxlint-disable-next-line no-unsafe-assignment -- vtk.js has no types for getApiSpecificRenderWindow(); narrowed below.
    const webGLRenderWindow = genericRenderWindow.value.getApiSpecificRenderWindow();
    // oxlint-disable-next-line no-unsafe-type-assertion -- trusted vtk.js OpenGL render window API boundary.
    const openGLRenderWindow = webGLRenderWindow as unknown as {
      getCanvas: () => HTMLCanvasElement;
    };
    const canvas = openGLRenderWindow.getCanvas();
    if (canvas.parentElement) {
      canvas.parentElement.style.cursor = value ? "crosshair" : "default";
    }
  });

  async function initHybridViewer(): Promise<void> {
    if (status.value !== Status.NOT_CREATED) {
      return;
    }
    status.value = Status.CREATING;
    genericRenderWindow.value = vtkGenericRenderWindow({
      background: BACKGROUND_COLOR,
      listenWindowResize: false,
    });
    const webGLRenderWindow =
      // oxlint-disable-next-line no-unsafe-type-assertion -- trusted vtk.js OpenGL render window API boundary.
      genericRenderWindow.value.getApiSpecificRenderWindow() as unknown as {
        getReferenceByName: (name: string) => { style: CSSStyleDeclaration };
        setBackgroundImage: (image: unknown) => void;
      };
    imageStyle = webGLRenderWindow.getReferenceByName("bgImage").style;
    Object.assign(imageStyle, {
      transition: "opacity 0.1s ease-in",
      zIndex: 1,
    });
    await viewerStore.ws_connect();
    // oxlint-disable-next-line no-unsafe-type-assertion -- trusted @kitware/vtk.js WebSocket client API boundary.
    const clientApi = viewerStore.client as unknown as {
      getImageStream: () => {
        createViewStream: (id: string) => ViewStreamLike;
      };
    };
    const imageStream = clientApi.getImageStream();
    viewportStore.viewStream.value = imageStream.createViewStream("-1");
    viewportStore.viewStream.value?.onImageReady((event: { image: unknown }) => {
      if (is_moving.value) {
        return;
      }
      // oxlint-disable no-unsafe-type-assertion -- image payload shape is guaranteed by the viewer's onImageReady contract.
      const latestImage = event.image as typeof brightnessStore.latestImage.value;
      // oxlint-enable no-unsafe-type-assertion
      brightnessStore.latestImage.value = latestImage;
      webGLRenderWindow.setBackgroundImage(event.image);
      if (imageStyle) {
        imageStyle.opacity = "1";
      }
    });
    const renderer = genericRenderWindow.value.getRenderer();
    const camera = renderer.getActiveCamera();
    Object.assign(cameraStore.camera_options, getCameraOptions(camera));
    camera.onModified(() => {
      Object.assign(cameraStore.camera_options, getCameraOptions(camera));
    });
    status.value = Status.CREATED;
  }

  function exportStores(): {
    zScale: number;
    camera_options: CameraOptions | Record<string, unknown>;
  } {
    const renderer = genericRenderWindow.value?.getRenderer();
    const camera = renderer?.getActiveCamera();
    return {
      zScale: sceneStore.zScale.value,
      camera_options: (camera ? getCameraOptions(camera) : undefined) ?? cameraStore.camera_options,
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
