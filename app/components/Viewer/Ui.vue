<script setup lang="ts">
import {
  type ViewerIdResult,
  useOverlappingPicker,
} from "@ogw_front/composables/use_overlapping_picker";
import OverlappingObjectsPicker from "@ogw_front/components/Viewer/OverlappingObjectsPicker.vue";
import ToolActiveChip from "@ogw_front/components/Viewer/ToolActiveChip.vue";
import type { TreeMenuPayload } from "@ogw_front/utils/treeview";
import ViewerContextMenu from "@ogw_front/components/Viewer/ContextMenu/ContextMenu.vue";
import ViewerObjectTreeLayout from "@ogw_front/components/Viewer/ObjectTree/Layout.vue";
import { getCurrentInstance } from "vue";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useMenuStore } from "@ogw_front/stores/menu";
import { useViewerStore } from "@ogw_front/stores/viewer";

interface Props {
  displayMenu: boolean;
  containerWidth: number;
  containerHeight: number;
}

const { displayMenu, containerWidth, containerHeight } = defineProps<Props>();

const emit = defineEmits<{
  "show-menu": [payload: TreeMenuPayload];
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

function get_viewer_id(x: number, y: number): Promise<ViewerIdResult> {
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

  <v-fade-transition group>
    <ToolActiveChip
      v-if="viewerStore.picking_mode"
      key="picking"
      data-testid="pickingActiveChip"
      label="Picking active — click in the viewer"
      color="secondary"
      icon="mdi-crosshairs-gps"
      @close="viewerStore.toggle_picking_mode(false)"
    />
    <ToolActiveChip
      v-if="hybridViewerStore.is_hover_highlight"
      key="hoverHighlight"
      data-testid="hoverHighlightChip"
      :label="hoverHighlightLabel"
      color="primary"
      @close="stopHoverHighlight"
    />
    <ToolActiveChip
      v-if="hybridViewerStore.is_ruler_active"
      key="ruler"
      data-testid="rulerActiveChip"
      :label="`Ruler — click to set point ${hybridViewerStore.ruler_awaiting_point}`"
      color="secondary"
      icon="mdi-ruler"
      @close="hybridViewerStore.clearRuler()"
    />
    <ToolActiveChip
      v-if="hybridViewerStore.is_zoom_box_active"
      key="zoomBox"
      data-testid="zoomBoxActiveChip"
      label="Zoom to box"
      color="primary"
      @close="hybridViewerStore.is_zoom_box_active = false"
    />
  </v-fade-transition>
</template>
