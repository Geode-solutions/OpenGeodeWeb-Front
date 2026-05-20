<script setup>
import ViewerContextMenu from "@ogw_front/components/Viewer/ContextMenu";
import ViewerObjectTreeLayout from "@ogw_front/components/Viewer/ObjectTree/Layout";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useMenuStore } from "@ogw_front/stores/menu";
import { useViewerStore } from "@ogw_front/stores/viewer";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const { displayMenu, containerWidth, containerHeight } = defineProps({
  displayMenu: { type: Boolean, required: true },
  containerWidth: { type: Number, required: true },
  containerHeight: { type: Number, required: true },
});

const emit = defineEmits(["show-menu"]);
const dataStore = useDataStore();
const dataStyleStore = useDataStyleStore();
const viewerStore = useViewerStore();
const menuStore = useMenuStore();
const hybridViewerStore = useHybridViewerStore();
const dataItems = dataStore.refAllItems();

function stopHoverHighlight() {
  hybridViewerStore.is_hover_highlight = false;
  hybridViewerStore.clearHoverHighlight();
}

onKeyStroke("Escape", () => {
  if (hybridViewerStore.is_hover_highlight) {
    stopHoverHighlight();
  }
});

async function get_viewer_id(x, y) {
  const activeIds = new Set(dataItems.value.map((item) => item.id));
  const ids = Object.keys(dataStyleStore.styles).filter((styleId) => activeIds.has(styleId));

  let result = { id: undefined, viewer_id: undefined };
  await viewerStore.request(
    viewer_schemas.opengeodeweb_viewer.viewer.picked_ids,
    { x, y, ids },
    {
      response_function: (response) => {
        const { array_ids, viewer_id } = response;
        const [first_id] = array_ids;
        result = { id: first_id, viewer_id };
      },
    },
  );
  return result;
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
  z-index: 100;
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
