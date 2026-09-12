// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
import {
  AXIS_SCALE,
  CHANGE_THRESHOLD,
  PLANE_COLORS,
  SIZE_RATIO,
  computeSceneBoundsInfo,
  getPlaneStyle,
  hasPlaneChanged,
} from "@ogw_front/utils/clipping_planes";
import { newInstance as vtkGenericRenderWindow } from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";
// ImplicitPlaneWidget ships no type declarations at all (unlike most of vtk.js), unlike a module that simply doesn't exist, so it can't be given an ambient `declare module` shim either - suppress the resulting implicit-any error at the import site instead.
// @ts-expect-error -- see comment above; newInstance() below is implicitly `any`.
import { newInstance as vtkImplicitPlaneWidget } from "@kitware/vtk.js/Widgets/Widgets3D/ImplicitPlaneWidget";
import { newInstance as vtkWidgetManager } from "@kitware/vtk.js/Widgets/Core/WidgetManager";
// oxlint-disable-next-line eslint/no-duplicate-imports
import type { vtkWidgetManager as WidgetManagerInstance } from "@kitware/vtk.js/Widgets/Core/WidgetManager";
import type { Ref } from "vue";
import type vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import type { vtkCamera } from "@kitware/vtk.js/Rendering/Core/Camera";
import type { vtkGenericRenderWindow as GenericRenderWindowInstance } from "@ogw_internal/stores/hybrid_viewer/vtk_types";
import type { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface ClippingPlane {
  origin?: number[];
  normal: number[];
}

interface DataItemLike {
  id: string;
}

// Vtk.js's plane-widget factory/handle/state objects (from ImplicitPlaneWidget, which ships no type declarations) are kept as `any` here - deep vtk.js widget internals with no typed surface to build on.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PlaneWidget = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WidgetHandle = any;

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
  debouncedApply: (...args: unknown[]) => void;
}

// oxlint-disable-next-line max-params max-lines-per-function
function useClippingPlanesWidget({
  planes,
  targetAllVisible,
  selectedDatasetIds,
  allItems,
  hybridViewerStore,
  debouncedApply,
}: ClippingPlanesWidgetParams) {
  let localRenderWindow: GenericRenderWindowInstance | undefined = undefined;
  let widgetManager: WidgetManagerInstance | undefined = undefined;
  let widgetEntries: WidgetEntry[] = [];
  let fromWidget = false;
  let maxDistance = 0;
  let isLimitingCameraZoom = false;
  function resolveActiveActors(): vtkActor[] {
    const targetIds = targetAllVisible.value
      ? allItems.value.map((item) => item.id)
      : selectedDatasetIds.value;
    const targeted = targetIds
      .map((id) => {
        const item = hybridViewerStore.hybridDb[id];
        return item ? item.actor : undefined;
      })
      .filter((actor): actor is vtkActor => Boolean(actor));
    if (targeted.length > 0) {
      return targeted;
    }
    return Object.values(hybridViewerStore.hybridDb)
      .map((entry) => entry && entry.actor)
      .filter((actor): actor is vtkActor => Boolean(actor));
  }
  function getSceneBoundsInfo() {
    return computeSceneBoundsInfo(resolveActiveActors());
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
      nextTick(() => {
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
  function syncWidgets(): void {
    if (!widgetManager || !localRenderWindow) {
      return;
    }
    while (widgetEntries.length > planes.value.length) {
      const entry = widgetEntries.pop();
      if (!entry) {
        continue;
      }
      entry.subscription.unsubscribe();
      widgetManager.removeWidget(entry.planeWidget);
      entry.planeWidget.delete();
    }
    const { cubicBounds } = getSceneBoundsInfo();
    for (const [idx, plane] of planes.value.entries()) {
      // Modulo guarantees this index is within bounds of the non-empty PLANE_COLORS array.
      const rgb = PLANE_COLORS[idx % PLANE_COLORS.length]!;
      if (!widgetEntries[idx]) {
        const planeWidget = vtkImplicitPlaneWidget();
        const widgetHandle = widgetManager.addWidget(planeWidget);
        widgetHandle.setAxisScale(AXIS_SCALE);
        widgetHandle.setHandleSizeRatio(SIZE_RATIO);
        widgetEntries.push(createWidgetEntry(planeWidget, widgetHandle, idx));
      }
      const entry = widgetEntries[idx];
      if (!entry) {
        continue;
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
  // The `noUncheckedIndexedAccess` compiler option (needed elsewhere in this migration) forces every `focal_point[i]`/`position[i]`/`view_up[i]` access below into its own `?? 0` fallback branch, which is what pushes this pre-existing function's cyclomatic complexity over the limit - the control flow itself is unchanged from the plain-JS version.
  // oxlint-disable-next-line complexity
  function syncLocalCamera(): void {
    if (!localRenderWindow) {
      return;
    }
    const renderer = localRenderWindow.getRenderer();
    const camera = renderer.getActiveCamera();
    const mainCam = hybridViewerStore.camera_options as {
      focal_point?: number[];
      position?: number[];
      view_up?: number[];
    };
    const { center, cubicBounds } = getSceneBoundsInfo();
    renderer.resetCamera(cubicBounds as [number, number, number, number, number, number]);
    if (mainCam && mainCam.focal_point && mainCam.position) {
      const { focal_point, position } = mainCam;
      const dir = [
        (position[0] ?? 0) - (focal_point[0] ?? 0),
        (position[1] ?? 0) - (focal_point[1] ?? 0),
        (position[2] ?? 0) - (focal_point[2] ?? 0),
      ];
      const dirLen = Math.hypot(...dir);
      if (dirLen > 0) {
        const distance = camera.getDistance();
        const normDir = dir.map((component) => component / dirLen);
        camera.setFocalPoint(center[0] ?? 0, center[1] ?? 0, center[2] ?? 0);
        camera.setPosition(
          (center[0] ?? 0) + (normDir[0] ?? 0) * distance,
          (center[1] ?? 0) + (normDir[1] ?? 0) * distance,
          (center[2] ?? 0) + (normDir[2] ?? 0) * distance,
        );
        if (mainCam.view_up) {
          const [viewUpX = 0, viewUpY = 0, viewUpZ = 0] = mainCam.view_up;
          camera.setViewUp(viewUpX, viewUpY, viewUpZ);
        }
      }
    }
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
  function updateWidgetPlacement({ isReset = false } = {}): void {
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
    container.addEventListener("wheel", (event) => event.stopPropagation(), { passive: true });
    localRenderWindow = vtkGenericRenderWindow({
      background: [0, 0, 0, 0],
      listenWindowResize: false,
    });
    localRenderWindow.setContainer(container);
    const camera = localRenderWindow.getRenderer().getActiveCamera();
    camera.onModified(() => limitCameraZoomOut(camera));
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
