import {
  AXIS_SCALE,
  PLANE_COLORS,
  SIZE_RATIO,
  getPlaneStyle,
  hasPlaneChanged,
} from "@ogw_front/utils/clipping_planes";
import type { Bounds, Coordinates, Ratio } from "@ogw_front/types/geometry";
import type { Opacity } from "@geode/opengeodeweb-viewer/schema_types";
import type { vtkWidgetManager as WidgetManagerInstance } from "@kitware/vtk.js/Widgets/Core/WidgetManager";
import type vtkAbstractWidget from "@kitware/vtk.js/Widgets/Core/AbstractWidget";
import type vtkAbstractWidgetFactory from "@kitware/vtk.js/Widgets/Core/AbstractWidgetFactory";
import { newInstance as vtkImplicitPlaneWidget } from "@kitware/vtk.js/Widgets/Widgets3D/ImplicitPlaneWidget";

// A clipping plane or slice, by the id its panel gives it: unique among both
type ClippingItemId = number;

// The position of a clipping plane in the list of planes, which also picks its color
type ClippingPlaneIndex = number;

// Where a clipping plane cuts and how opaque it is drawn
interface ClippingPlaneGeometry {
  origin?: Coordinates;
  normal: Coordinates;
  opacity: Opacity;
}

// A clipping plane of the list, with the id of its widget entry
interface ClippingPlane extends ClippingPlaneGeometry {
  id: ClippingItemId;
}

interface ClippingWidgetState {
  getOrigin: () => Coordinates;
  setOrigin: (origin: Readonly<Coordinates>) => void;
  getNormal: () => Coordinates;
  setNormal: (normal: Readonly<Coordinates>) => void;
  onModified: (callback: () => void) => { unsubscribe: () => void };
}

interface PlaneWidget {
  getWidgetState: () => ClippingWidgetState;
  delete: () => void;
}

interface WidgetHandle {
  setAxisScale: (scale: number) => void;
  setHandleSizeRatio: (ratio: Ratio) => void;
  setRepresentationStyle: (style: unknown) => void;
  placeWidget: (bounds: Readonly<Bounds>) => void;
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

function asWidgetHandle(widget: unknown): WidgetHandle {
  // oxlint-disable-next-line no-unsafe-type-assertion -- vtk.js WidgetManager.addWidget is untyped for our custom WidgetHandle shape; narrowed here.
  return widget as WidgetHandle;
}

interface WidgetEntryManagerParams {
  planes: Ref<ClippingPlane[]>;
  debouncedApply: (...args: readonly unknown[]) => void;
}

// oxlint-disable-next-line max-lines-per-function typescript/prefer-readonly-parameter-types -- Ref-backed params are inherently mutable through .value.
function useWidgetEntryManager({ planes, debouncedApply }: WidgetEntryManagerParams): {
  removeExtraWidgets: (widgetManager: WidgetManagerInstance | undefined) => void;
  updateWidgetEntry: (
    idx: ClippingPlaneIndex,
    plane: ClippingPlane,
    cubicBounds: Readonly<Bounds>,
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
    planeIndex: ClippingPlaneIndex,
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
      const origin: Coordinates = widgetState
        .getOrigin()
        .map((val: number) => Number(val.toFixed(4)));
      const normal: Coordinates = widgetState
        .getNormal()
        .map((val: number) => Number(val.toFixed(4)));
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
    idx: ClippingPlaneIndex,
    plane: ClippingPlane,
    cubicBounds: Readonly<Bounds>,
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
      const widgetHandle = asWidgetHandle(widgetManager.addWidget(asWidgetFactory(planeWidget)));
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

export {
  useWidgetEntryManager,
  type ClippingItemId,
  type ClippingPlane,
  type ClippingPlaneGeometry,
  type ClippingPlaneIndex,
};
