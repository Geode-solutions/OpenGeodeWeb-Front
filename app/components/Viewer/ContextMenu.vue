<script setup>
import { geode_objects } from "@ogw_front/assets/geode_objects";
import { useAdaptiveStyles } from "@ogw_front/composables/use_adaptive_styles";
import { useEventListener } from "@vueuse/core";
import { useMenuStore } from "@ogw_front/stores/menu";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

const RADIUS = 80;
const MARGIN_OFFSET = 40;
const Z_INDEX_ACTIVE_ITEM = 10;
const Z_INDEX_BASE_ITEM = 1;
const FULL_ANGLE = 360;
const ANGLE_45 = 45;
const ANGLE_135 = 135;
const ANGLE_225 = 225;
const ANGLE_315 = 315;
const CLOSE_DELAY = 100;

const COPIED_TIMEOUT = 1500;
const MAX_SHORT_ID_LENGTH = 15;
const ID_SLICE_START = 8;
const ID_SLICE_END_OFFSET = 7;
const TREEVIEW_MARGIN_LEFT = 10;
const TREEVIEW_ICON_WIDTH = 48;
const TREEVIEW_MARGIN_RIGHT = 20;
const ADAPTIVE_BLUR_VAL = "15px";
const ADAPTIVE_OPACITY_VAL = 0.85;
const ADAPTIVE_BRIGHTNESS_VAL = 1.15;
const DRAG_THRESHOLD_VAL = 3;

const menuStore = useMenuStore();

const {
  id: propId,
  x,
  y,
  containerWidth,
  containerHeight,
} = defineProps({
  id: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  containerWidth: { type: Number, required: true },
  containerHeight: { type: Number, required: true },
});

const meta_data = computed(() => menuStore.current_meta_data || {});

const cleanName = computed(() => {
  const meta = menuStore.current_meta_data;
  if (!meta) {
    return "Unnamed Object";
  }
  return meta.name || "Unnamed Object";
});

const show_menu = ref(true);
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

let dragMoved = false;
const dragThreshold = DRAG_THRESHOLD_VAL;
let dragStartClientX = 0;
let dragStartClientY = 0;
const showName = ref(false);

const copied = ref(false);
async function copyId(targetId) {
  if (!targetId) {
    return;
  }
  try {
    await navigator.clipboard.writeText(targetId);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, COPIED_TIMEOUT);
  } catch (error) {
    console.error("Failed to copy ID:", error);
  }
}

const formattedId = computed(() => {
  const metaId = meta_data.value?.id;
  if (!metaId) {
    return "";
  }
  if (metaId.length <= MAX_SHORT_ID_LENGTH) {
    return metaId;
  }
  return `${metaId.slice(0, ID_SLICE_START)}...${metaId.slice(metaId.length - ID_SLICE_END_OFFSET)}`;
});

const treeviewStore = useTreeviewStore();
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

const activatorBtn = ref(undefined);
const { adaptiveStyles } = useAdaptiveStyles(activatorBtn, {
  maxOpacity: 0.85,
});

const computedItemStyles = computed(() => {
  if (isOverTreeview.value) {
    return {
      "--adaptive-blur": ADAPTIVE_BLUR_VAL,
      "--adaptive-opacity": ADAPTIVE_OPACITY_VAL,
      "--adaptive-brightness": ADAPTIVE_BRIGHTNESS_VAL,
    };
  }
  return adaptiveStyles.value;
});

function startDrag(event) {
  isDragging.value = true;
  dragMoved = false;
  dragStartX.value = event.clientX - menuX.value;
  dragStartY.value = event.clientY - menuY.value;
  dragStartClientX = event.clientX;
  dragStartClientY = event.clientY;
}

function clampPosition(posX, posY) {
  const margin = RADIUS + MARGIN_OFFSET;
  return {
    x: Math.min(Math.max(posX, margin), containerWidth - margin),
    y: Math.min(Math.max(posY, margin), containerHeight - margin),
  };
}

function handleDrag(event) {
  const deltaX = event.clientX - dragStartClientX;
  const deltaY = event.clientY - dragStartClientY;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance > dragThreshold) {
    dragMoved = true;
  }

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

function onCenterClick(event) {
  event.stopPropagation();
  if (!dragMoved) {
    showName.value = !showName.value;
  }
}

function getMenuStyle() {
  return {
    position: "fixed",
    left: `${menuStore.containerLeft + menuX.value - RADIUS}px`,
    top: `${menuStore.containerTop + menuY.value - RADIUS}px`,
  };
}

function getTooltipLocation(index) {
  const angle = (index / menuItemCount.value) * FULL_ANGLE;
  if (angle < ANGLE_45 || angle >= ANGLE_315) {
    return "right";
  }
  if (angle >= ANGLE_45 && angle < ANGLE_135) {
    return "top";
  }
  if (angle >= ANGLE_135 && angle < ANGLE_225) {
    return "left";
  }
  return "bottom";
}

function getTooltipOrigin(index) {
  const angle = (index / menuItemCount.value) * FULL_ANGLE;
  if (angle < ANGLE_45 || angle >= ANGLE_315) {
    return "left";
  }
  if (angle >= ANGLE_45 && angle < ANGLE_135) {
    return "bottom";
  }
  if (angle >= ANGLE_135 && angle < ANGLE_225) {
    return "right";
  }
  return "top";
}

function getItemStyle(index) {
  const angle = (index / menuItemCount.value) * 2 * Math.PI;
  return {
    transform: `translate(${Math.cos(angle) * RADIUS}px, ${Math.sin(angle) * RADIUS}px)`,
    transition: "opacity 0.2s ease, transform 0.2s ease",
    position: "absolute",
    zIndex: menuStore.active_item_index === index ? Z_INDEX_ACTIVE_ITEM : Z_INDEX_BASE_ITEM,
  };
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
        <component
          v-for="(item, index) in menu_items"
          :is="item"
          :key="index"
          :index="index"
          :itemProps="{
            id: id,
            meta_data,
            tooltip_location: getTooltipLocation(index),
            tooltip_origin: getTooltipOrigin(index),
            totalItems: menuItemCount,
          }"
          class="menu-item-wrapper"
          :style="getItemStyle(index)"
          @mousedown.stop
        />

        <!-- Active Object Central Indicator -->
        <v-btn
          ref="activatorBtn"
          icon
          variant="outlined"
          class="central-selector-btn elevation-6"
          style="width: 52px; height: 52px; z-index: 5"
          :style="computedItemStyles"
          @mousedown="startDrag"
          @click.stop="onCenterClick"
        >
          <v-icon
            icon="mdi-information-outline"
            size="28"
            color="primary"
            style="pointer-events: none"
          />
        </v-btn>

        <!-- Direct local name display (no teleportation, no lag!) -->
        <transition name="fade-scale">
          <div v-if="showName" class="object-name-popover" @mousedown.stop @click.stop>
            <GlassCard
              variant="panel"
              padding="pa-2 px-3"
              rounded="lg"
              class="elevation-12 text-center border-thin"
              min-width="140"
              max-width="250"
            >
              <div
                class="text-subtitle-2 font-weight-bold text-truncate text-white"
                style="line-height: 1.3"
              >
                {{ cleanName }}
              </div>
              <div
                class="text-caption font-weight-black text-uppercase text-secondary"
                style="font-size: 0.68rem; line-height: 1.2"
              >
                {{ meta_data.geode_object_type }}
              </div>
              <div
                v-if="meta_data.id"
                class="id-badge-container mt-1 d-inline-flex align-center px-2 py-0.5"
                @click.stop="copyId(meta_data.id)"
              >
                <span class="id-text">
                  {{ copied ? "COPIED!" : formattedId }}
                </span>
                <v-icon
                  :icon="copied ? 'mdi-check' : 'mdi-content-copy'"
                  size="10"
                  :color="copied ? 'success' : 'white'"
                  class="ml-1"
                />
              </div>
            </GlassCard>
          </div>
        </transition>
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

.menu-item-wrapper {
  position: absolute;
  transform-origin: center;
  will-change: transform, opacity;
}

.central-selector-btn {
  background: transparent !important;
  border: 2px solid rgba(var(--v-theme-primary), 0.35) !important;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
}

.central-selector-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, var(--adaptive-opacity));
  backdrop-filter: blur(var(--adaptive-blur)) brightness(var(--adaptive-brightness));
  -webkit-backdrop-filter: blur(var(--adaptive-blur)) brightness(var(--adaptive-brightness));
  z-index: 0;
  pointer-events: none;
  border-radius: inherit;
  transition:
    background-color 0.2s ease,
    backdrop-filter 0.2s ease;
}

.central-selector-btn:hover {
  transform: scale(1.08);
  border-color: rgba(var(--v-theme-primary), 0.85) !important;
}

.central-selector-btn:hover::before {
  background: rgba(255, 255, 255, calc(var(--adaptive-opacity, 0.15) + 0.15));
}

.object-name-popover {
  position: absolute;
  bottom: 110px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.id-badge-container {
  font-family: monospace;
  font-size: 0.6rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  opacity: 0.8;
}

.id-badge-container:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.35);
  opacity: 1;
  transform: scale(1.03);
}

.id-badge-container:active {
  transform: scale(0.97);
}

.id-text {
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.85);
}
</style>
