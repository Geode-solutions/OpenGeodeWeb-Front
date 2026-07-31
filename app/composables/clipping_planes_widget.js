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
import { newInstance as vtkImplicitPlaneWidget } from "@kitware/vtk.js/Widgets/Widgets3D/ImplicitPlaneWidget";
import { newInstance as vtkWidgetManager } from "@kitware/vtk.js/Widgets/Core/WidgetManager";

// oxlint-disable-next-line max-params max-lines-per-function
export function useClippingPlanesWidget({
  planes,
  targetAllVisible,
  selectedDatasetIds,
  allItems,
  hybridViewerStore,
  debouncedApply,
}) {
  let localRenderWindow = undefined;
  let widgetManager = undefined;
  let widgetEntries = [];
  let fromWidget = false;
  let maxDistance = 0;
  let isLimitingCameraZoom = false;

  function resolveActiveActors() {
    const targetIds = targetAllVisible.value
      ? allItems.value.map((item) => item.id)
      : selectedDatasetIds.value;
    const targeted = targetIds
      .map((id) => {
        const item = hybridViewerStore.hybridDb[id];
        return item ? item.actor : undefined;
      })
      .filter(Boolean);
    if (targeted.length > 0) {
      return targeted;
    }
    return Object.values(hybridViewerStore.hybridDb)
      .map((entry) => entry && entry.actor)
      .filter(Boolean);
  }

  function getSceneBoundsInfo() {
    return computeSceneBoundsInfo(resolveActiveActors());
  }

  function getSceneCenter() {
    return getSceneBoundsInfo().center;
  }

  function createWidgetEntry(planeWidget, widgetHandle, planeIndex) {
    const widgetState = planeWidget.getWidgetState();
    const plane = planes.value[planeIndex];
    if (plane.origin) {
      widgetState.setOrigin(plane.origin);
    }
    widgetState.setNormal(plane.normal);
    const subscription = widgetState.onModified(() => {
      if (fromWidget) {
        return;
      }
      const origin = widgetState.getOrigin().map((val) => Number(val.toFixed(4)));
      const normal = widgetState.getNormal().map((val) => Number(val.toFixed(4)));
      if (
        !hasPlaneChanged(
          origin,
          normal,
          planes.value[planeIndex].origin,
          planes.value[planeIndex].normal,
        )
      ) {
        return;
      }
      fromWidget = true;
      planes.value[planeIndex].origin = origin;
      planes.value[planeIndex].normal = normal;
      nextTick(() => {
        fromWidget = false;
      });
      debouncedApply();
    });

    return { planeWidget, widgetHandle, subscription };
  }

  function syncWidgets() {
    if (!widgetManager || !localRenderWindow) {
      return;
    }
    while (widgetEntries.length > planes.value.length) {
      const entry = widgetEntries.pop();
      entry.subscription.unsubscribe();
      widgetManager.removeWidget(entry.planeWidget);
      entry.planeWidget.delete();
    }
    const { cubicBounds } = getSceneBoundsInfo();
    for (const [idx, plane] of planes.value.entries()) {
      const rgb = PLANE_COLORS[idx % PLANE_COLORS.length];
      if (!widgetEntries[idx]) {
        const planeWidget = vtkImplicitPlaneWidget();
        const widgetHandle = widgetManager.addWidget(planeWidget);
        widgetHandle.setAxisScale(AXIS_SCALE);
        widgetHandle.setHandleSizeRatio(SIZE_RATIO);
        widgetEntries.push(createWidgetEntry(planeWidget, widgetHandle, idx));
      }
      const entry = widgetEntries[idx];
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

  function limitCameraZoomOut(camera) {
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
    localRenderWindow.getRenderWindow().render();
    isLimitingCameraZoom = false;
  }

  function syncLocalCamera() {
    if (!localRenderWindow) {
      return;
    }
    const renderer = localRenderWindow.getRenderer();
    const camera = renderer.getActiveCamera();
    const mainCam = hybridViewerStore.camera_options;
    const { center, cubicBounds } = getSceneBoundsInfo();
    renderer.resetCamera(cubicBounds);
    if (mainCam && mainCam.focal_point && mainCam.position) {
      const dir = [
        mainCam.position[0] - mainCam.focal_point[0],
        mainCam.position[1] - mainCam.focal_point[1],
        mainCam.position[2] - mainCam.focal_point[2],
      ];
      const dirLen = Math.hypot(...dir);
      if (dirLen > 0) {
        const distance = camera.getDistance();
        const normDir = dir.map((component) => component / dirLen);
        camera.setFocalPoint(...center);
        camera.setPosition(
          center[0] + normDir[0] * distance,
          center[1] + normDir[1] * distance,
          center[2] + normDir[2] * distance,
        );
        if (mainCam.view_up) {
          camera.setViewUp(...mainCam.view_up);
        }
      }
    }

    limitCameraZoomOut(camera);
    localRenderWindow.getRenderWindow().render();
  }

  function cleanupLocalWidget() {
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

  function initLocalWidget(container) {
    cleanupLocalWidget();
    container.addEventListener("wheel", (event) => event.stopPropagation(), { passive: true });
    localRenderWindow = vtkGenericRenderWindow({
      background: [0, 0, 0, 0],
      listenWindowResize: false,
    });
    localRenderWindow.setContainer(container);
    const camera = localRenderWindow.getRenderer().getActiveCamera();
    camera.onModified(() => limitCameraZoomOut(camera));
    const canvas = localRenderWindow.getApiSpecificRenderWindow().getCanvas();
    Object.assign(canvas.style, { width: "100%", height: "100%", background: "transparent" });
    localRenderWindow.resize();
    widgetManager = vtkWidgetManager();
    widgetManager.setRenderer(localRenderWindow.getRenderer());
    updateWidgetPlacement();
  }

  function updateWidgetPlacement({ isReset = false } = {}) {
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

  function isFromWidget() {
    return fromWidget;
  }

  function setFromWidget(value) {
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
