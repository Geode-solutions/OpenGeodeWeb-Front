import {
  AXIS_SCALE,
  PLANE_COLORS,
  SIZE_RATIO,
  getPlaneStyle,
  hasPlaneChanged,
} from "@ogw_front/utils/clipping_planes";
import type { vtkWidgetManager as WidgetManagerInstance } from "@kitware/vtk.js/Widgets/Core/WidgetManager";
import type vtkAbstractWidget from "@kitware/vtk.js/Widgets/Core/AbstractWidget";
import type vtkAbstractWidgetFactory from "@kitware/vtk.js/Widgets/Core/AbstractWidgetFactory";
import { newInstance as vtkImplicitPlaneWidget } from "@kitware/vtk.js/Widgets/Widgets3D/ImplicitPlaneWidget";

interface ClippingPlane {
  origin?: number[];
  normal: number[];
}

interface ClippingWidgetState {
  getOrigin: () => number[];
  setOrigin: (origin: readonly number[]) => void;
  getNormal: () => number[];
  setNormal: (normal: readonly number[]) => void;
  onModified: (callback: () => void) => { unsubscribe: () => void };
}

interface PlaneWidget {
  getWidgetState: () => ClippingWidgetState;
  delete: () => void;
}

interface WidgetHandle {
  setAxisScale: (scale: number) => void;
  setHandleSizeRatio: (ratio: number) => void;
  setRepresentationStyle: (style: unknown) => void;
  placeWidget: (bounds: readonly number[]) => void;
}

interface WidgetEntry {
  planeWidget: PlaneWidget;
  widgetHandle: WidgetHandle;
  subscription: { unsubscribe: () => void };
}

function asWidgetFactory(widget: PlaneWidget): vtkAbstractWidgetFactory<vtkAbstractWidget> {
  // oxlint-disable-next-line no-unsafe-type-assertion -- vtk.js's WidgetManager APIs (addWidget/removeWidget) are untyped for our custom PlaneWidget shape; narrowed once here.
  return widget as unknown as vtkAbstractWidgetFactory<vtkAbstractWidget>;
}

interface WidgetEntryManagerParams {
  planes: Ref<ClippingPlane[]>;
  debouncedApply: (...args: readonly unknown[]) => void;
}

// oxlint-disable-next-line max-lines-per-function typescript/prefer-readonly-parameter-types -- Ref-backed params are inherently mutable through .value.
function useWidgetEntryManager({ planes, debouncedApply }: WidgetEntryManagerParams): {
  removeExtraWidgets: (widgetManager: WidgetManagerInstance | undefined) => void;
  updateWidgetEntry: (
    idx: number,
    plane: ClippingPlane,
    cubicBounds: readonly number[],
    widgetManager: WidgetManagerInstance,
  ) => void;
  cleanupAll: (widgetManager: WidgetManagerInstance | undefined) => void;
  isFromWidget: () => boolean;
  setFromWidget: (value: boolean) => void;
} {
  let widgetEntries: WidgetEntry[] = [];
  let fromWidget = false;

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
        // oxlint-disable-next-line promise/prefer-await-to-then -- fire-and-forget inside a sync widget callback; see codebase convention in global_attribute_style.ts.
      }).catch(() => undefined);
      debouncedApply();
    });
    return {
      planeWidget,
      widgetHandle,
      subscription,
    };
  }

  function removeExtraWidgets(widgetManager: WidgetManagerInstance | undefined): void {
    while (widgetEntries.length > planes.value.length) {
      const entry = widgetEntries.pop();
      if (!entry) {
        continue;
      }
      entry.subscription.unsubscribe();
      widgetManager?.removeWidget(asWidgetFactory(entry.planeWidget));
      entry.planeWidget.delete();
    }
  }

  function updateWidgetEntry(
    idx: number,
    plane: ClippingPlane,
    cubicBounds: readonly number[],
    widgetManager: WidgetManagerInstance,
  ): void {
    // Modulo guarantees this index is within bounds of the non-empty PLANE_COLORS array.
    const rgb = PLANE_COLORS[idx % PLANE_COLORS.length];
    if (rgb === undefined) {
      return;
    }
    if (!widgetEntries[idx]) {
      // oxlint-disable-next-line no-unsafe-call no-unsafe-type-assertion -- vtk.js has no types for ImplicitPlaneWidget's factory; narrowed here.
      const planeWidget = vtkImplicitPlaneWidget() as PlaneWidget;
      const widgetHandle = widgetManager.addWidget(
        asWidgetFactory(planeWidget),
        // oxlint-disable-next-line no-unsafe-type-assertion -- vtk.js WidgetManager.addWidget is untyped for our custom WidgetHandle shape; narrowed here.
      ) as unknown as WidgetHandle;
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

  function cleanupAll(widgetManager: WidgetManagerInstance | undefined): void {
    for (const entry of widgetEntries) {
      entry.subscription.unsubscribe();
      if (widgetManager) {
        widgetManager.removeWidget(asWidgetFactory(entry.planeWidget));
      }
      entry.planeWidget.delete();
    }
    widgetEntries = [];
  }

  function isFromWidget(): boolean {
    return fromWidget;
  }

  function setFromWidget(value: boolean): void {
    fromWidget = value;
  }

  return {
    removeExtraWidgets,
    updateWidgetEntry,
    cleanupAll,
    isFromWidget,
    setFromWidget,
  };
}

export { useWidgetEntryManager, type ClippingPlane };
