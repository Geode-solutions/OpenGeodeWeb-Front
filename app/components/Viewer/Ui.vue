<script setup>
import { ref, getCurrentInstance } from "vue";
import ViewerContextMenu from "@ogw_front/components/Viewer/ContextMenu";
import ViewerObjectTreeLayout from "@ogw_front/components/Viewer/ObjectTree/Layout";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useMenuStore } from "@ogw_front/stores/menu";
import { useViewerStore } from "@ogw_front/stores/viewer";
import { geode_objects } from "@ogw_front/assets/geode_objects";
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
const dataItems = dataStore.refAllItems();

const displayIntermediate = ref(false);
const intermediateItems = ref([]);
const intermediateMenuX = ref(0);
const intermediateMenuY = ref(0);
let resolveIntermediate = undefined;

function getIntermediateMenuStyle() {
  return {
    position: "fixed",
    left: `${intermediateMenuX.value}px`,
    top: `${intermediateMenuY.value}px`,
  };
}

function selectIntermediateItem(item) {
  if (resolveIntermediate) {
    resolveIntermediate(item);
    resolveIntermediate = undefined;
  }
}

function handleIntermediateMenuUpdate(val) {
  if (!val && resolveIntermediate) {
    resolveIntermediate(undefined);
    resolveIntermediate = undefined;
  }
}
function cleanItemName(fullName, id) {
  if (!fullName) return "";
  if (id && fullName.endsWith(` - ${id}`)) {
    return fullName.substring(0, fullName.length - ` - ${id}`.length);
  }
  const uuidRegex = / - [0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return fullName.replace(uuidRegex, "");
}

function formatListId(id) {
  if (!id) return "";
  if (id.length <= 16) return id;
  return `${id.substring(0, 8)}...${id.substring(id.length - 8)}`;
}

async function get_viewer_id(x, y) {
  const activeIds = new Set(dataItems.value.map((item) => item.id));
  const ids = Object.keys(dataStyleStore.styles).filter((styleId) =>
    activeIds.has(styleId),
  );

  let result = { id: undefined, viewer_id: undefined };
  let pickedResponse = undefined;

  await viewerStore.request(
    viewer_schemas.opengeodeweb_viewer.viewer.picked_ids,
    { x, y, ids },
    {
      response_function: (response) => {
        pickedResponse = response;
      },
    },
  );

  if (
    !pickedResponse ||
    !pickedResponse.array_ids ||
    pickedResponse.array_ids.length === 0
  ) {
    return result;
  }

  const { array_ids, viewer_id, picked_data } = pickedResponse;

  const pickedList = [];
  if (picked_data && picked_data.length > 0) {
    pickedList.push(...picked_data);
  } else {
    for (const pickId of array_ids) {
      pickedList.push({ id: pickId, viewer_id });
    }
  }

  if (pickedList.length <= 1) {
    result = { id: pickedList[0]?.id, viewer_id: pickedList[0]?.viewer_id };
    return result;
  }

  const proposedItems = [];
  for (const pick of pickedList) {
    try {
      const item = await dataStore.item(pick.id);
      let cleanName = cleanItemName(item.name, pick.id) || "Unnamed Object";
      if (item.viewer_type === "model" && pick.viewer_id !== undefined) {
        const component = await dataStore.getComponentByViewerId(pick.id, pick.viewer_id);
        if (component && component.name) {
          cleanName = `${cleanName} - ${component.name}`;
        }
      }
      proposedItems.push({
        id: pick.id,
        viewer_id: pick.viewer_id,
        name: cleanName,
        viewer_type: item.viewer_type,
        geode_object_type: item.geode_object_type,
      });
    } catch (e) {
      proposedItems.push({
        id: pick.id,
        viewer_id: pick.viewer_id,
        name: "Unnamed Object",
        viewer_type: undefined,
        geode_object_type: undefined,
      });
    }
  }

  intermediateItems.value = proposedItems;

  const yUI = containerHeight - y;
  const instance = getCurrentInstance();
  const containerRect = instance?.proxy?.$el
    ?.closest?.('[data-testid="hybridViewer"]')
    ?.getBoundingClientRect() ||
    document
      .querySelector('[data-testid="hybridViewer"]')
      ?.getBoundingClientRect() || { left: 0, top: 0 };

  const MENU_WIDTH = 340;
  const MENU_HEIGHT = 280;
  const clampedX = Math.min(Math.max(x, 10), containerWidth - MENU_WIDTH - 10);
  const clampedY = Math.min(Math.max(yUI, 10), containerHeight - MENU_HEIGHT - 10);

  intermediateMenuX.value = containerRect.left + clampedX;
  intermediateMenuY.value = containerRect.top + clampedY;
  displayIntermediate.value = true;

  return new Promise((resolve) => {
    resolveIntermediate = (chosenResult) => {
      displayIntermediate.value = false;
      resolve(
        chosenResult
          ? { id: chosenResult.id, viewer_id: chosenResult.viewer_id }
          : { id: undefined, viewer_id: undefined },
      );
    };
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

  <!-- Premium Glassmorphic Intermediate Selection Pre-Menu -->
  <v-menu
    :model-value="displayIntermediate"
    :close-on-content-click="true"
    :style="getIntermediateMenuStyle()"
    :overlay="false"
    @update:model-value="handleIntermediateMenuUpdate"
  >
    <GlassCard
      variant="panel"
      padding="pa-0"
      rounded="lg"
      class="elevation-12"
      min-width="260"
      max-width="340"
    >
      <v-card-title class="d-flex align-center py-2 px-3 text-caption text-uppercase font-weight-black text-medium-emphasis">
        <v-icon icon="mdi-layers-triple" size="small" class="mr-2" color="secondary" />
        Overlapping objects
      </v-card-title>
      
      <v-divider />
      
      <v-list class="py-1 bg-transparent" density="compact">
        <v-list-item
          v-for="item in intermediateItems"
          :key="`${item.id}-${item.viewer_id}`"
          class="intermediate-picker-item px-3 py-2"
          @click="selectIntermediateItem(item)"
        >
          <template #prepend>
            <v-img
              v-if="geode_objects[item.geode_object_type]?.image"
              :src="geode_objects[item.geode_object_type].image"
              height="24"
              width="24"
              max-width="24"
              class="mr-3"
              style="object-fit: contain; filter: brightness(0) invert(1);"
            />
            <v-icon
              v-else
              icon="mdi-cube-outline"
              size="24"
              color="white"
              class="mr-3"
            />
          </template>
          
          <v-list-item-title class="font-weight-bold text-body-2 text-truncate text-white">
            {{ item.name }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption text-truncate text-medium-emphasis mt-0.5 d-flex align-center">
            <span class="font-weight-medium mr-1">{{ item.geode_object_type }}</span>
            <span style="font-family: monospace; opacity: 0.65; font-size: 0.72rem;">&middot; {{ formatListId(item.id) }}</span>
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </GlassCard>
  </v-menu>

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

.intermediate-picker-item {
  transition: all 0.2s ease;
  border-radius: 8px !important;
  margin: 2px 6px;
}

.intermediate-picker-item:hover {
  background: rgba(var(--v-theme-secondary), 0.1) !important;
  transform: translateX(4px);
}
</style>
