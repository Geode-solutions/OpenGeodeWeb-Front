<script setup lang="ts">
import OverlappingObjectsPicker from "@ogw_front/components/Viewer/OverlappingObjectsPicker.vue";
import ToolActiveChip from "@ogw_front/components/Viewer/ToolActiveChip.vue";
import ViewerContextMenu from "@ogw_front/components/Viewer/ContextMenu/ContextMenu.vue";
import ViewerObjectTreeLayout from "@ogw_front/components/Viewer/ObjectTree/Layout.vue";
import { getCurrentInstance } from "vue";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useMenuStore } from "@ogw_front/stores/menu";
import { useOverlappingPicker } from "@ogw_front/composables/use_overlapping_picker";
import { useViewerStore } from "@ogw_front/stores/viewer";

interface Props {
  displayMenu: boolean;
  containerWidth: number;
  containerHeight: number;
}

const { displayMenu, containerWidth, containerHeight } = defineProps<Props>();

const emit = defineEmits<{
  "show-menu": [args: unknown];
}>();
const menuStore = useMenuStore();
const viewerStore = useViewerStore();
const hybridViewerStore = useHybridViewerStore();

const hoverHighlightLabel = computed(
  () =>
    `Highlight active (${hybridViewerStore.hover_highlight_field_type === "CELL" ? "Cells" : "Points"})`,
);

function stopHoverHighlight(): void {
  hybridViewerStore.is_hover_highlight = false;
  hybridViewerStore.clearHoverHighlight();
}

onKeyStroke("Escape", (event) => {
  let consumed = false;
  if (viewerStore.picking_mode) {
    viewerStore.toggle_picking_mode(false);
    consumed = true;
  } else if (hybridViewerStore.is_picking) {
    hybridViewerStore.is_picking = false;
    consumed = true;
  } else if (hybridViewerStore.is_zoom_box_active) {
    hybridViewerStore.is_zoom_box_active = false;
    consumed = true;
  } else if (hybridViewerStore.is_ruler_active) {
    hybridViewerStore.deactivateRuler();
    consumed = true;
  } else if (hybridViewerStore.is_hover_highlight) {
    stopHoverHighlight();
    consumed = true;
  }
  if (consumed && event) {
    event.stopImmediatePropagation();
  }
});

const {
  displayIntermediate,
  intermediateItems,
  getIntermediateMenuStyle,
  selectIntermediateItem,
  handleIntermediateMenuUpdate,
  get_viewer_id: trigger_picker,
} = useOverlappingPicker();

function get_viewer_id(x: number, y: number): string {
  const instance = getCurrentInstance();
  const containerRect = instance?.proxy?.$el
    ?.closest?.('[data-testid="hybridViewer"]')
    ?.getBoundingClientRect() ||
    document.querySelector('[data-testid="hybridViewer"]')?.getBoundingClientRect() || {
      left: 0,
      top: 0,
    };

  return trigger_picker({
    x,
    y,
    containerWidth,
    containerHeight,
    containerRect,
  });
}

defineExpose({ get_viewer_id });
</script>

<template>
  <ViewerObjectTreeLayout
    :container-width="containerWidth"
    @show-menu="(args) => emit('show-menu', args)"
  />
  <ViewerContextMenu
    v-if="displayMenu"
    :id="menuStore.current_id ?? ''"
    :x="menuStore.menuX"
    :y="menuStore.menuY"
    :container-width="containerWidth"
    :container-height="containerHeight"
  />

  <OverlappingObjectsPicker
    :display-intermediate="displayIntermediate"
    :intermediate-items="intermediateItems"
    :menu-style="getIntermediateMenuStyle()"
    @select="selectIntermediateItem"
    @update:display-intermediate="handleIntermediateMenuUpdate"
  />

  <ToolActiveChip
    data-testid="pickingActiveChip"
    :show="viewerStore.picking_mode"
    label="Picking active — click in the viewer"
    color="secondary"
    icon="mdi-crosshairs-gps"
    @close="viewerStore.toggle_picking_mode(false)"
  />
  <ToolActiveChip
    data-testid="hoverHighlightChip"
    :show="hybridViewerStore.is_hover_highlight"
    :label="hoverHighlightLabel"
    color="primary"
    @close="stopHoverHighlight"
  />
  <ToolActiveChip
    data-testid="rulerActiveChip"
    :show="hybridViewerStore.is_ruler_active"
    :label="`Ruler — click to set point ${hybridViewerStore.ruler_awaiting_point}`"
    color="secondary"
    icon="mdi-ruler"
    @close="hybridViewerStore.clearRuler()"
  />
  <ToolActiveChip
    data-testid="zoomBoxActiveChip"
    :show="hybridViewerStore.is_zoom_box_active"
    label="Zoom to box"
    color="primary"
    @close="hybridViewerStore.is_zoom_box_active = false"
  />
</template>
