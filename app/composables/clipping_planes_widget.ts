import {
  CHANGE_THRESHOLD,
  type MainCameraOptions,
  type SceneBoundsInfo,
  alignCameraToMainCamera,
  computeSceneBoundsInfo,
  resolveActiveActors,
} from "@ogw_front/utils/clipping_planes";
import {
  type ClippingPlane,
  useWidgetEntryManager,
} from "@ogw_front/composables/clipping_planes_widget_entries";
import {
  type vtkWidgetManager as WidgetManagerInstance,
  newInstance as vtkWidgetManager,
} from "@kitware/vtk.js/Widgets/Core/WidgetManager";
import type { vtkGenericRenderWindow as GenericRenderWindowInstance } from "@ogw_internal/stores/hybrid_viewer/vtk_types";
import type { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import type { vtkCamera } from "@kitware/vtk.js/Rendering/Core/Camera";
import { newInstance as vtkGenericRenderWindow } from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";

interface DataItemLike {
  id: string;
}

interface ClippingPlanesWidgetParams {
  planes: Ref<ClippingPlane[]>;
  targetAllVisible: Ref<boolean>;
  selectedDatasetIds: Ref<string[]>;
  allItems: Ref<DataItemLike[]>;
  hybridViewerStore: ReturnType<typeof useHybridViewerStore>;
  debouncedApply: (...args: readonly unknown[]) => void;
}

// oxlint-disable-next-line max-params max-lines-per-function typescript/prefer-readonly-parameter-types -- Ref-backed params are inherently mutable through .value.
function useClippingPlanesWidget({
  planes,
  targetAllVisible,
  selectedDatasetIds,
  allItems,
  hybridViewerStore,
  debouncedApply,
}: ClippingPlanesWidgetParams): {
  getSceneCenter: typeof getSceneCenter;
  syncWidgets: typeof syncWidgets;
  syncLocalCamera: typeof syncLocalCamera;
  cleanupLocalWidget: typeof cleanupLocalWidget;
  initLocalWidget: typeof initLocalWidget;
  updateWidgetPlacement: typeof updateWidgetPlacement;
  isFromWidget: typeof isFromWidget;
  setFromWidget: typeof setFromWidget;
} {
  let localRenderWindow: GenericRenderWindowInstance | undefined = undefined;
  let widgetManager: WidgetManagerInstance | undefined = undefined;
  let maxDistance = 0;
  let isLimitingCameraZoom = false;
  const widgetEntryManager = useWidgetEntryManager({ planes, debouncedApply });

  function getSceneBoundsInfo(): SceneBoundsInfo {
    return computeSceneBoundsInfo(
      resolveActiveActors(
        targetAllVisible.value,
        allItems.value,
        selectedDatasetIds.value,
        hybridViewerStore.hybridDb,
      ),
    );
  }
  function getSceneCenter(): readonly number[] {
    return getSceneBoundsInfo().center;
  }

  function syncWidgets(): void {
    if (!widgetManager || !localRenderWindow) {
      return;
    }
    widgetEntryManager.removeExtraWidgets(widgetManager);
    const { cubicBounds } = getSceneBoundsInfo();
    for (const [idx, plane] of planes.value.entries()) {
      widgetEntryManager.updateWidgetEntry(idx, plane, cubicBounds, widgetManager);
    }
    localRenderWindow.getRenderWindow().render();
  }

  function limitCameraZoomOut(camera: vtkCamera): void {
    if (maxDistance <= 0 || isLimitingCameraZoom) {
      return;
    }
    const currentDist = camera.getDistance();
    if (currentDist <= maxDistance + CHANGE_THRESHOLD) {
      return;
    }
    isLimitingCameraZoom = true;
    const focal = camera.getFocalPoint();
    const pos = camera.getPosition();
    const ratio = maxDistance / currentDist;
    camera.setPosition(
      focal[0] + (pos[0] - focal[0]) * ratio,
      focal[1] + (pos[1] - focal[1]) * ratio,
      focal[2] + (pos[2] - focal[2]) * ratio,
    );
    localRenderWindow?.getRenderWindow().render();
    isLimitingCameraZoom = false;
  }

  function syncLocalCamera(): void {
    if (!localRenderWindow) {
      return;
    }
    const renderer = localRenderWindow.getRenderer();
    const camera = renderer.getActiveCamera();
    const mainCam = hybridViewerStore.camera_options as MainCameraOptions;
    const { center, cubicBounds } = getSceneBoundsInfo();
    // oxlint-disable-next-line no-unsafe-type-assertion -- cubicBounds is always a 6-element bounds tuple.
    renderer.resetCamera(cubicBounds as [number, number, number, number, number, number]);
    alignCameraToMainCamera(camera, mainCam, center);
    limitCameraZoomOut(camera);
    localRenderWindow.getRenderWindow().render();
  }

  function cleanupLocalWidget(): void {
    maxDistance = 0;
    isLimitingCameraZoom = false;
    widgetEntryManager.cleanupAll(widgetManager);
    if (localRenderWindow) {
      localRenderWindow.delete();
      localRenderWindow = undefined;
      widgetManager = undefined;
    }
  }
  function updateWidgetPlacement({ isReset = false }: { isReset?: boolean } = {}): void {
    if (!widgetManager || !localRenderWindow) {
      return;
    }
    if (isReset) {
      maxDistance = 0;
    }
    const center = getSceneCenter();
    for (const plane of planes.value) {
      if (!plane.origin || isReset) {
        plane.origin = [...center];
      }
    }
    syncWidgets();
    syncLocalCamera();
    if (maxDistance <= 0) {
      maxDistance = localRenderWindow.getRenderer().getActiveCamera().getDistance();
    }
  }

  function initLocalWidget(container: HTMLElement): void {
    cleanupLocalWidget();
    container.addEventListener(
      "wheel",
      (event: WheelEvent) => {
        event.stopPropagation();
      },
      { passive: true },
    );
    localRenderWindow = vtkGenericRenderWindow({
      background: [0, 0, 0, 0],
      listenWindowResize: false,
    });
    localRenderWindow.setContainer(container);
    const camera = localRenderWindow.getRenderer().getActiveCamera();
    camera.onModified(() => {
      limitCameraZoomOut(camera);
    });
    // oxlint-disable-next-line no-unsafe-type-assertion -- trusted vtk.js OpenGL render window API boundary.
    const openGLRenderWindow = localRenderWindow.getApiSpecificRenderWindow() as unknown as {
      getCanvas: () => HTMLCanvasElement;
    };
    const canvas = openGLRenderWindow.getCanvas();
    Object.assign(canvas.style, {
      width: "100%",
      height: "100%",
      background: "transparent",
    });
    localRenderWindow.resize();
    widgetManager = vtkWidgetManager();
    widgetManager.setRenderer(localRenderWindow.getRenderer());
    updateWidgetPlacement();
  }

  function isFromWidget(): boolean {
    return widgetEntryManager.isFromWidget();
  }

  function setFromWidget(value: boolean): void {
    widgetEntryManager.setFromWidget(value);
  }

  return {
    getSceneCenter,
    syncWidgets,
    syncLocalCamera,
    cleanupLocalWidget,
    initLocalWidget,
    updateWidgetPlacement,
    isFromWidget,
    setFromWidget,
  };
}
export { useClippingPlanesWidget };
