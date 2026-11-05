import type { PickedFieldType } from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";

interface ToolRefs {
  showScreenshot: Ref<boolean>;
  showCameraManager: Ref<boolean>;
  showCameraOrientation: Ref<boolean>;
  showZScaling: Ref<boolean>;
  showClippingPlanes: Ref<boolean>;
  showShrinkFilter: Ref<boolean>;
  showExplodeFilter: Ref<boolean>;
  showThresholdFilter: Ref<boolean>;
  showRuler: Ref<boolean>;
}

interface ViewToolbarTools extends ToolRefs {
  is_picking: Ref<boolean>;
  is_zoom_box_active: Ref<boolean>;
  stopHoverHighlight: () => void;
  toggleTool: (toolRef: Ref<boolean>) => void;
  toggleHoverHighlight: (fieldType: PickedFieldType) => void;
}

function createToolRefs(): ToolRefs {
  return {
    showScreenshot: ref<boolean>(false),
    showCameraManager: ref<boolean>(false),
    showCameraOrientation: ref<boolean>(false),
    showZScaling: ref<boolean>(false),
    showClippingPlanes: ref<boolean>(false),
    showShrinkFilter: ref<boolean>(false),
    showExplodeFilter: ref<boolean>(false),
    showThresholdFilter: ref<boolean>(false),
    showRuler: ref<boolean>(false),
  };
}

function exclusiveTools(toolRefs: ToolRefs, pickingTools: Ref<boolean>[]): Ref<boolean>[] {
  return [
    toolRefs.showCameraOrientation,
    toolRefs.showCameraManager,
    toolRefs.showScreenshot,
    toolRefs.showZScaling,
    toolRefs.showClippingPlanes,
    toolRefs.showShrinkFilter,
    toolRefs.showExplodeFilter,
    toolRefs.showThresholdFilter,
    toolRefs.showRuler,
    ...pickingTools,
  ];
}

// The toolbar tools are exclusive: opening one closes the others
function useViewToolbarTools(): ViewToolbarTools {
  const hybridViewerStore = useHybridViewerStore();
  const viewerStore = useViewerStore();
  const { is_picking, is_zoom_box_active } = storeToRefs(hybridViewerStore);
  const { picking_mode } = storeToRefs(viewerStore);
  const toolRefs = createToolRefs();
  const allTools = exclusiveTools(toolRefs, [is_picking, is_zoom_box_active, picking_mode]);

  function stopHoverHighlight(): void {
    hybridViewerStore.is_hover_highlight = false;
    hybridViewerStore.clearHoverHighlight();
  }

  function closeAllToolsExcept(toolRef: Ref<boolean>): void {
    for (const tool of allTools) {
      if (tool !== toolRef) {
        tool.value = false;
      }
    }
    if (toolRef !== toolRefs.showRuler) {
      void nextTick(stopHoverHighlight);
    }
  }

  function toggleTool(toolRef: Ref<boolean>): void {
    closeAllToolsExcept(toolRef);
    toolRef.value = !toolRef.value;
  }

  function toggleHoverHighlight(fieldType: PickedFieldType): void {
    const activate =
      !hybridViewerStore.is_hover_highlight ||
      hybridViewerStore.hover_highlight_field_type !== fieldType;
    closeAllToolsExcept(toolRefs.showRuler);
    if (activate) {
      hybridViewerStore.is_hover_highlight = true;
      hybridViewerStore.hover_highlight_field_type = fieldType;
    } else {
      stopHoverHighlight();
    }
  }

  return {
    ...toolRefs,
    is_picking,
    is_zoom_box_active,
    stopHoverHighlight,
    toggleTool,
    toggleHoverHighlight,
  };
}

export { useViewToolbarTools };
export type { ViewToolbarTools };
