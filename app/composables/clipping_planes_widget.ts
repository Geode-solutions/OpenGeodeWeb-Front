import {
  AXIS_SCALE,
  CHANGE_THRESHOLD,
  type MainCameraOptions,
  PLANE_COLORS,
  SIZE_RATIO,
  type SceneBoundsInfo,
  alignCameraToMainCamera,
  computeSceneBoundsInfo,
  getPlaneStyle,
  hasPlaneChanged,
  resolveActiveActors,
} from "@ogw_front/utils/clipping_planes";
import {
  type vtkWidgetManager as WidgetManagerInstance,
  newInstance as vtkWidgetManager,
} from "@kitware/vtk.js/Widgets/Core/WidgetManager";
import type { vtkGenericRenderWindow as GenericRenderWindowInstance } from "@ogw_internal/stores/hybrid_viewer/vtk_types";
import type { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import type { vtkCamera } from "@kitware/vtk.js/Rendering/Core/Camera";
import { newInstance as vtkGenericRenderWindow } from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";
import { newInstance as vtkImplicitPlaneWidget } from "@kitware/vtk.js/Widgets/Widgets3D/ImplicitPlaneWidget";

interface ClippingPlane {
  origin?: number[];
  normal: number[];
}

interface DataItemLike {
  id: string;
}

type PlaneWidget = unknown;
type WidgetHandle = unknown;

interface WidgetEntry {
  planeWidget: PlaneWidget;
  widgetHandle: WidgetHandle;
  subscription: { unsubscribe: () => void };
}

interface ClippingPlanesWidgetParams {
  planes: Ref<ClippingPlane[]>;
  targetAllVisible: Ref<boolean>;
  selectedDatasetIds: Ref<string[]>;
  allItems: Ref<DataItemLike[]>;
  hybridViewerStore: ReturnType<typeof useHybridViewerStore>;
  debouncedApply: (...args: readonly unknown[]) => void;
}

// oxlint-disable-next-line max-params max-lines-per-function
function useClippingPlanesWidget({
  planes,
  targetAllVisible,
  selectedDatasetIds,
  allItems,
  hybridViewerStore,
  debouncedApply,
}: Readonly<ClippingPlanesWidgetParams>): {
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
  let widgetEntries: WidgetEntry[] = [];
  let fromWidget = false;
  let maxDistance = 0;
  let isLimitingCameraZoom = false;
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
  function getSceneCenter(): number[] {
    return getSceneBoundsInfo().center;
  }
  function createWidgetEntry(
    planeWidget: PlaneWidget,
    widgetHandle: WidgetHandle,
    planeIndex: number,
  ): WidgetEntry {
    const widgetState = planeWidget.getWidgetState();
    const plane = planes.value[planeIndex];
    if (plane?.origin) {
      widgetState.setOrigin(plane.origin);
    }
    if (plane) {
      widgetState.setNormal(plane.normal);
    }
    const subscription = widgetState.onModified(() => {
      if (fromWidget) {
        return;
      }
      const origin: number[] = widgetState.getOrigin().map((val: number) => Number(val.toFixed(4)));
      const normal: number[] = widgetState.getNormal().map((val: number) => Number(val.toFixed(4)));
      const currentPlane = planes.value[planeIndex];
      if (
        !currentPlane ||
        !hasPlaneChanged(origin, normal, currentPlane.origin, currentPlane.normal)
      ) {
        return;
      }
      fromWidget = true;
      currentPlane.origin = origin;
      currentPlane.normal = normal;
      void nextTick(() => {
        fromWidget = false;
      });
      debouncedApply();
    });
    return {
      planeWidget,
      widgetHandle,
      subscription,
    };
  }
  function removeExtraWidgets(): void {
    while (widgetEntries.length > planes.value.length) {
      const entry = widgetEntries.pop();
      if (!entry) {
        continue;
      }
      entry.subscription.unsubscribe();
      widgetManager?.removeWidget(entry.planeWidget);
      entry.planeWidget.delete();
    }
  }

  function updateWidgetEntry(
    idx: number,
    plane: Readonly<ClippingPlane>,
    cubicBounds: readonly number[],
  ): void {
    // Modulo guarantees this index is within bounds of the non-empty PLANE_COLORS array.
    const rgb = PLANE_COLORS[idx % PLANE_COLORS.length];
    if (rgb === undefined || !widgetManager) {
      return;
    }
    if (!widgetEntries[idx]) {
      const planeWidget = vtkImplicitPlaneWidget();
      const widgetHandle = widgetManager.addWidget(planeWidget);
      widgetHandle.setAxisScale(AXIS_SCALE);
      widgetHandle.setHandleSizeRatio(SIZE_RATIO);
      widgetEntries.push(createWidgetEntry(planeWidget, widgetHandle, idx));
    }
    const entry = widgetEntries[idx];
    if (!entry) {
      return;
    }
    entry.widgetHandle.setRepresentationStyle(getPlaneStyle(rgb));
    fromWidget = true;
    entry.widgetHandle.placeWidget(cubicBounds);
    fromWidget = false;
    entry.widgetHandle.setAxisScale(AXIS_SCALE);
    entry.widgetHandle.setHandleSizeRatio(SIZE_RATIO);
    const widgetState = entry.planeWidget.getWidgetState();
    if (plane.origin) {
      widgetState.setOrigin(plane.origin);
    }
    widgetState.setNormal(plane.normal);
  }

  function syncWidgets(): void {
    if (!widgetManager || !localRenderWindow) {
      return;
    }
    removeExtraWidgets();
    const { cubicBounds } = getSceneBoundsInfo();
    for (const [idx, plane] of planes.value.entries()) {
      updateWidgetEntry(idx, plane, cubicBounds);
    }
    localRenderWindow.getRenderWindow().render();
  }

  function limitCameraZoomOut(camera: Readonly<vtkCamera>): void {
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
    renderer.resetCamera(cubicBounds as [number, number, number, number, number, number]);
    alignCameraToMainCamera(camera, mainCam, center);
    limitCameraZoomOut(camera);
    localRenderWindow.getRenderWindow().render();
  }

  function cleanupLocalWidget(): void {
    maxDistance = 0;
    isLimitingCameraZoom = false;
    for (const entry of widgetEntries) {
      entry.subscription.unsubscribe();
      if (widgetManager) {
        widgetManager.removeWidget(entry.planeWidget);
      }
      entry.planeWidget.delete();
    }
    widgetEntries = [];
    if (localRenderWindow) {
      localRenderWindow.delete();
      localRenderWindow = undefined;
      widgetManager = undefined;
    }
  }
  function updateWidgetPlacement({ isReset = false }: Readonly<{ isReset?: boolean }> = {}): void {
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

  function initLocalWidget(container: Readonly<HTMLElement>): void {
    cleanupLocalWidget();
    container.addEventListener(
      "wheel",
      (event: Readonly<WheelEvent>) => {
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
    const canvas = (
      localRenderWindow.getApiSpecificRenderWindow() as unknown as {
        getCanvas: () => HTMLCanvasElement;
      }
    ).getCanvas();
    Object.assign(canvas.style, { width: "100%", height: "100%", background: "transparent" });
    localRenderWindow.resize();
    widgetManager = vtkWidgetManager();
    widgetManager.setRenderer(localRenderWindow.getRenderer());
    updateWidgetPlacement();
  }

  function isFromWidget(): boolean {
    return fromWidget;
  }

  function setFromWidget(value: boolean): void {
    fromWidget = value;
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
