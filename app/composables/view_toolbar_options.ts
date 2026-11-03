import {
  type CameraOptionAction,
  controlOptions,
  filterOptions,
  panelOptions,
  rulerOption,
} from "@ogw_front/composables/view_toolbar_tool_options";
import type { ViewToolbarTools } from "@ogw_front/composables/view_toolbar_tools";
import schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";

type HybridViewerStore = ReturnType<typeof useHybridViewerStore>;

function pickingOptions(
  hybridViewerStore: HybridViewerStore,
  tools: ViewToolbarTools,
): CameraOptionAction[] {
  return [
    {
      testId: "resetCameraButton",
      tooltip: "Reset camera",
      icon: "mdi-cube-scan",
      action: (): void => {
        hybridViewerStore.resetCamera();
      },
    },
    {
      testId: "centerOnClickButton",
      tooltip: "Center on click",
      icon: "mdi-crosshairs-question",
      color: hybridViewerStore.is_picking ? "primary" : undefined,
      action: (): void => {
        tools.toggleTool(tools.is_picking);
      },
    },
    {
      testId: "zoomToBoxButton",
      tooltip: "Zoom to box",
      icon: "mdi-magnify-scan",
      color: hybridViewerStore.is_zoom_box_active ? "primary" : undefined,
      action: (): void => {
        tools.toggleTool(tools.is_zoom_box_active);
      },
    },
  ];
}

function hoverHighlightOption(
  hybridViewerStore: HybridViewerStore,
  tools: ViewToolbarTools,
): CameraOptionAction {
  return {
    testId: "highlightOnHoverButton",
    tooltip: "Highlight on hover",
    icon: "mdi-cursor-default-click",
    color: hybridViewerStore.is_hover_highlight ? "primary" : undefined,
    action: hybridViewerStore.is_hover_highlight ? tools.stopHoverHighlight : undefined,
    menu: [
      {
        title: "Cells",
        testId: "highlightOnHoverCellsButton",
        icon: "mdi-select-all",
        action: (): void => {
          tools.toggleHoverHighlight("CELL");
        },
      },
      {
        title: "Points",
        testId: "highlightOnHoverPointsButton",
        icon: "mdi-select-drag",
        action: (): void => {
          tools.toggleHoverHighlight("POINT");
        },
      },
    ],
  };
}

function gridScaleOption(
  hybridViewerStore: HybridViewerStore,
  viewerStore: ReturnType<typeof useViewerStore>,
  gridScale: Ref<boolean>,
): CameraOptionAction {
  return {
    testId: "gridScaleButton",
    tooltip: "Toggle grid scale",
    icon: "mdi-ruler-square",
    color: gridScale.value ? "primary" : undefined,
    action: (): void => {
      const schema = schemas.opengeodeweb_viewer.viewer.grid_scale;
      const params = { visibility: !gridScale.value };
      void viewerStore.request(
        {
          schema,
          params,
        },
        {
          response_function: () => {
            gridScale.value = !gridScale.value;
            void hybridViewerStore.remoteRender();
          },
        },
      );
    },
  };
}

// The buttons of the view toolbar
function useViewToolbarOptions(tools: ViewToolbarTools): ComputedRef<CameraOptionAction[]> {
  const hybridViewerStore = useHybridViewerStore();
  const viewerStore = useViewerStore();
  const gridScale = ref<boolean>(false);

  return computed<CameraOptionAction[]>(() => [
    ...pickingOptions(hybridViewerStore, tools),
    hoverHighlightOption(hybridViewerStore, tools),
    ...panelOptions(tools),
    gridScaleOption(hybridViewerStore, viewerStore, gridScale),
    ...controlOptions(tools),
    ...filterOptions(tools),
    rulerOption(tools),
  ]);
}

export { useViewToolbarOptions };
