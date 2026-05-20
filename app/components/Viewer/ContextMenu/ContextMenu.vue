<script setup>
import CenterButton from "@ogw_front/components/Viewer/ContextMenu/CenterButton";
import CircularItems from "@ogw_front/components/Viewer/ContextMenu/CircularItems";
import InfoCard from "@ogw_front/components/Viewer/ContextMenu/InfoCard";
import { useEventListener } from "@vueuse/core";
import { useMenuStore } from "@ogw_front/stores/menu";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

const { id, x, y, containerWidth, containerHeight } = defineProps({
  id: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  containerWidth: { type: Number, required: true },
  containerHeight: { type: Number, required: true },
});

const RADIUS = 80;
const MARGIN_OFFSET = 40;
const CLOSE_DELAY = 100;
const TREEVIEW_MARGIN_LEFT = 10;
const TREEVIEW_ICON_WIDTH = 48;
const TREEVIEW_MARGIN_RIGHT = 20;
const CENTER_BUTTON_SIZE = 52;
const CENTER_BUTTON_HALF_SIZE = 26;

const menuStore = useMenuStore();
const treeviewStore = useTreeviewStore();

const meta_data = computed(() => menuStore.current_meta_data || {});

const show_menu = ref(true);
const showName = ref(false);
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const menuX = ref(x);
const menuY = ref(y);

watch(
  () => [x, y, containerWidth, containerHeight],
  ([newX, newY]) => {
    const { x: clampedX, y: clampedY } = clampPosition(newX, newY);
    menuX.value = clampedX;
    menuY.value = clampedY;
    menuStore.setMenuPosition(clampedX, clampedY);
  },
  { immediate: true },
);

useEventListener(
  globalThis,
  "mousemove",
  (event) => {
    if (!isDragging.value) {
      return;
    }
    handleDrag(event);
  },
  { passive: true },
);

useEventListener(globalThis, "mouseup", (event) => {
  if (!isDragging.value) {
    return;
  }
  stopDrag(event);
});

const menu_items = shallowRef([]);
watch(
  () => [meta_data.value.viewer_type, meta_data.value.geode_object_type],
  ([viewer_type, geode_object_type]) => {
    menu_items.value = menuStore.getMenuItems(viewer_type, geode_object_type);
  },
  { immediate: true },
);

const menuItemCount = computed(() => menu_items.value.length);

const isOverTreeview = computed(() => {
  const hasAdditional = treeviewStore.opened_views.some((view) => view.id !== "main");
  const hasMain = treeviewStore.opened_views.some((view) => view.id === "main");
  const firstColWidth = hasMain ? treeviewStore.panelWidth : 0;
  const secondColWidth = hasAdditional ? treeviewStore.additionalPanelWidth : 0;
  const treeviewWidth =
    TREEVIEW_MARGIN_LEFT +
    TREEVIEW_ICON_WIDTH +
    firstColWidth +
    secondColWidth +
    TREEVIEW_MARGIN_RIGHT;
  return menuX.value < treeviewWidth;
});

const isOverToolbar = computed(() => {
  const toolbarEl = document.querySelector(".view-toolbar");
  if (!toolbarEl) {
    return false;
  }
  const rect = toolbarEl.getBoundingClientRect();
  const btnX = menuStore.containerLeft + menuX.value - CENTER_BUTTON_HALF_SIZE;
  const btnY = menuStore.containerTop + menuY.value - CENTER_BUTTON_HALF_SIZE;
  const btnWidth = CENTER_BUTTON_SIZE;
  const btnHeight = CENTER_BUTTON_SIZE;
  return (
    btnX < rect.right &&
    btnX + btnWidth > rect.left &&
    btnY < rect.bottom &&
    btnY + btnHeight > rect.top
  );
});

function startDrag(event) {
  isDragging.value = true;
  dragStartX.value = event.clientX - menuX.value;
  dragStartY.value = event.clientY - menuY.value;
}

function clampPosition(posX, posY) {
  const margin = RADIUS + MARGIN_OFFSET;
  return {
    x: Math.min(Math.max(posX, margin), containerWidth - margin),
    y: Math.min(Math.max(posY, margin), containerHeight - margin),
  };
}

function handleDrag(event) {
  const { x: clampedX, y: clampedY } = clampPosition(
    event.clientX - dragStartX.value,
    event.clientY - dragStartY.value,
  );
  menuX.value = clampedX;
  menuY.value = clampedY;
  menuStore.setMenuPosition(clampedX, clampedY);
}

function stopDrag(event) {
  isDragging.value = false;
  event.stopPropagation();
  menuStore.setMenuPosition(menuX.value, menuY.value);
}

function getMenuStyle() {
  return {
    position: "fixed",
    left: `${menuStore.containerLeft + menuX.value - RADIUS}px`,
    top: `${menuStore.containerTop + menuY.value - RADIUS}px`,
  };
}

function toggleShowName() {
  showName.value = !showName.value;
}
</script>

<template>
  <v-menu
    v-model="show_menu"
    content-class="circular-menu-container"
    :style="getMenuStyle()"
    :close-on-content-click="false"
    :close-delay="CLOSE_DELAY"
    :overlay="false"
  >
    <div class="circular-menu-drag-handle" @mousedown.stop="startDrag">
      <div
        class="circular-menu-items"
        :style="{ width: `${RADIUS * 2}px`, height: `${RADIUS * 2}px` }"
      >
        <CircularItems
          :menu-items="menu_items"
          :id="id"
          :meta-data="meta_data"
          :menu-item-count="menuItemCount"
        />

        <CenterButton
          :is-over-treeview="isOverTreeview"
          :is-over-toolbar="isOverToolbar"
          @drag="startDrag"
          @click="toggleShowName"
        />

        <InfoCard v-model:show="showName" :meta-data="meta_data" />
      </div>
    </div>
  </v-menu>
</template>

<style scoped>
:deep(.circular-menu-container) {
  overflow: visible !important;
  box-shadow: none !important;
  border: none !important;
  background: transparent !important;
  contain: none !important;
}

.circular-menu-drag-handle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  cursor: grab;
  user-select: none;
  -webkit-user-select: none;
}

.circular-menu-drag-handle:active {
  cursor: grabbing;
}

.circular-menu-items {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: transparent;
  border: none;
}
</style>
