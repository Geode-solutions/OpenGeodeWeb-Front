<script setup>
import OverlappingObjectsPicker from "@ogw_front/components/Viewer/OverlappingObjectsPicker";
import ViewerContextMenu from "@ogw_front/components/Viewer/ContextMenu/ContextMenu";
import ViewerObjectTreeLayout from "@ogw_front/components/Viewer/ObjectTree/Layout";
import { getCurrentInstance } from "vue";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useMenuStore } from "@ogw_front/stores/menu";
import { useOverlappingPicker } from "@ogw_front/composables/use_overlapping_picker";
import { useViewerStore } from "@ogw_front/stores/viewer";

const { displayMenu, containerWidth, containerHeight } = defineProps({
  displayMenu: { type: Boolean, required: true },
  containerWidth: { type: Number, required: true },
  containerHeight: { type: Number, required: true },
});

const emit = defineEmits(["show-menu"]);
const menuStore = useMenuStore();
const viewerStore = useViewerStore();
const hybridViewerStore = useHybridViewerStore();

function stopHoverHighlight() {
  hybridViewerStore.is_hover_highlight = false;
  hybridViewerStore.clearHoverHighlight();
}

onKeyStroke("Escape", () => {
  if (hybridViewerStore.is_hover_highlight) {
    stopHoverHighlight();
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

function get_viewer_id(x, y) {
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
    :id="menuStore.current_id"
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

  <v-fade-transition>
    <div
      v-if="viewerStore.picking_mode"
      class="picking-message-container d-flex justify-center w-100 pa-4"
    >
      <v-chip
        color="secondary"
        elevation="8"
        size="large"
        variant="flat"
        prepend-icon="mdi-crosshairs-gps"
        class="pick-pulse"
        style="pointer-events: auto"
        @click="viewerStore.toggle_picking_mode(false)"
      >
        Picking active — click in the viewer &middot; Esc to stop
        <v-divider vertical class="mx-2 my-1" opacity="0.3" />
        <v-icon icon="mdi-close" size="small" />
      </v-chip>
    </div>
  </v-fade-transition>

  <v-fade-transition>
    <div
      v-if="hybridViewerStore.is_hover_highlight"
      class="picking-message-container d-flex justify-center w-100 pa-4"
    >
      <v-chip
        color="primary"
        elevation="8"
        size="large"
        variant="flat"
        class="pick-pulse"
        style="pointer-events: auto"
        @click="stopHoverHighlight"
      >
        Highlight active ({{
          hybridViewerStore.hover_highlight_field_type === "CELL" ? "Cells" : "Points"
        }}) &middot; Esc to stop
        <v-divider vertical class="mx-2 my-1" opacity="0.3" />
        <v-icon icon="mdi-close" size="small" />
      </v-chip>
    </div>
  </v-fade-transition>
</template>

<style scoped>
.picking-message-container {
  position: absolute;
  top: 20px;
  left: 0;
  pointer-events: none;
  z-index: 3;
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-secondary), 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(var(--v-theme-secondary), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-secondary), 0);
  }
}

.pick-pulse {
  animation: pulse-ring 1.5s ease-out infinite;
}
</style>
