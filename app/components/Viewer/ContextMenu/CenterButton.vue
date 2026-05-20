<script setup>
import { useAdaptiveStyles } from "@ogw_front/composables/use_adaptive_styles";
import { useMenuStore } from "@ogw_front/stores/menu";

const { isOverTreeview, isOverToolbar } = defineProps({
  isOverTreeview: { type: Boolean, required: true },
  isOverToolbar: { type: Boolean, default: false },
});

const emit = defineEmits(["drag", "click"]);

const ADAPTIVE_BLUR_VAL = "15px";
const ADAPTIVE_OPACITY_VAL = 0.85;
const ADAPTIVE_BRIGHTNESS_VAL = 1.15;
const dragThreshold = 3;

const menuStore = useMenuStore();

const centerButtonCoords = computed(() => {
  const size = 52;
  return {
    x: menuStore.containerLeft + menuStore.menuX - size / 2,
    y: menuStore.containerTop + menuStore.menuY - size / 2,
    width: size,
    height: size,
  };
});

const { adaptiveStyles } = useAdaptiveStyles(centerButtonCoords, {
  minOpacity: 0.35,
  maxOpacity: 1,
});

const computedItemStyles = computed(() => {
  if (isOverTreeview || isOverToolbar) {
    return {
      "--adaptive-blur": ADAPTIVE_BLUR_VAL,
      "--adaptive-opacity": ADAPTIVE_OPACITY_VAL,
      "--adaptive-brightness": ADAPTIVE_BRIGHTNESS_VAL,
    };
  }
  return adaptiveStyles.value;
});

let dragMoved = false;
let dragStartClientX = 0;
let dragStartClientY = 0;

function onMouseDown(event) {
  dragMoved = false;
  dragStartClientX = event.clientX;
  dragStartClientY = event.clientY;
  emit("drag", event);
}

function onMouseUp(event) {
  const deltaX = event.clientX - dragStartClientX;
  const deltaY = event.clientY - dragStartClientY;
  if (Math.hypot(deltaX, deltaY) > dragThreshold) {
    dragMoved = true;
  }
}

function onCenterClick(event) {
  event.stopPropagation();
  if (!dragMoved) {
    emit("click", event);
  }
}
</script>

<template>
  <v-btn
    icon
    variant="outlined"
    class="central-selector-btn elevation-6"
    style="width: 52px; height: 52px; z-index: 5"
    :style="computedItemStyles"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
    @click.stop="onCenterClick"
  >
    <v-icon icon="mdi-information-outline" size="28" color="primary" style="pointer-events: none" />
  </v-btn>
</template>

<style scoped>
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
</style>
