<script setup>
import GlassCard from "@ogw_front/components/GlassCard";
import { useAdaptiveStyles } from "@ogw_front/composables/use_adaptive_styles";
import { useMenuStore } from "@ogw_front/stores/menu";
import { useTheme } from "vuetify";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

const CARD_WIDTH = 320;
const CARD_HEIGHT = 500;
const MARGIN = 60;
const RADIUS = 80;
const OFFSET = 40;

const menuStore = useMenuStore();
const theme = useTheme();
const primaryColor = computed(() => theme.current.value.colors.primary);

const { index, itemProps, tooltip, btn_image } = defineProps({
  index: { type: Number, required: true },
  itemProps: { type: Object, required: true },
  tooltip: { type: String, required: true },
  btn_image: { type: String, required: true },
});

const buttonCoords = computed(() => {
  const angle = (index / itemProps.totalItems) * 2 * Math.PI;
  const deltaX = Math.cos(angle) * RADIUS;
  const deltaY = Math.sin(angle) * RADIUS;
  const size = 40;
  return {
    x: menuStore.containerLeft + menuStore.menuX + deltaX - size / 2,
    y: menuStore.containerTop + menuStore.menuY + deltaY - size / 2,
    width: size,
    height: size,
  };
});

const { adaptiveStyles } = useAdaptiveStyles(buttonCoords, { maxOpacity: 0.85 });

const TREEVIEW_MARGIN_LEFT = 10;
const TREEVIEW_MARGIN_RIGHT = 20;
const TREEVIEW_ICON_WIDTH = 48;

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
  return buttonCoords.value.x < treeviewWidth;
});

const computedItemStyles = computed(() => {
  if (isOverTreeview.value) {
    return {
      "--adaptive-blur": "15px",
      "--adaptive-opacity": 0.85,
      "--adaptive-brightness": 1.15,
    };
  }
  return adaptiveStyles.value;
});

const is_active = computed(() => menuStore.active_item_index === index);
const optionsRef = ref(undefined);
const { height: optionsHeight } = useElementSize(optionsRef);

const maxCardHeight = computed(() => Math.min(CARD_HEIGHT, menuStore.containerHeight - OFFSET));

const optionsStyle = computed(() => {
  if (!is_active.value || !optionsHeight.value) {
    return {};
  }
  const angle = (index / itemProps.totalItems) * 2 * Math.PI;
  const radius = RADIUS;
  const absoluteButtonY = menuStore.menuY + Math.sin(angle) * radius;
  const height = optionsHeight.value;
  const margin = MARGIN;
  let offsetY = 0;

  if (absoluteButtonY - height / 2 < margin) {
    offsetY = margin - (absoluteButtonY - height / 2);
  } else if (absoluteButtonY + height / 2 > menuStore.containerHeight - margin) {
    offsetY = menuStore.containerHeight - margin - (absoluteButtonY + height / 2);
  }
  return { top: `calc(50% + ${offsetY}px)` };
});

const optionsClass = computed(() => {
  const loc = itemProps.tooltip_location;
  const margin = MARGIN;
  const radius = RADIUS;
  if (loc === "right") {
    return menuStore.menuX + radius + margin + CARD_WIDTH > menuStore.containerWidth
      ? "options-left"
      : "options-right";
  }
  return menuStore.menuX - radius - margin - CARD_WIDTH < 0 ? "options-right" : "options-left";
});

function toggleOptions() {
  menuStore.toggleItemOptions(index);
}
</script>
<template>
  <v-sheet class="menu-item-container transition-swing" color="transparent">
    <v-tooltip :location="itemProps.tooltip_location" :origin="itemProps.tooltip_origin">
      <template v-slot:activator="{ props: tooltipProps }">
        <v-btn
          ref="itemBtnRef"
          icon
          variant="outlined"
          :active="is_active"
          @click.stop="toggleOptions"
          v-bind="tooltipProps"
          class="menu-btn"
          elevation="2"
          :style="computedItemStyles"
        >
          <v-img
            :src="btn_image"
            height="28"
            width="28"
            style="pointer-events: none; object-fit: contain"
          />
        </v-btn>
      </template>
      <span>{{ tooltip }}</span>
    </v-tooltip>

    <v-sheet
      v-if="is_active"
      ref="optionsRef"
      class="menu-options d-flex align-center pa-0"
      :class="optionsClass"
      :style="optionsStyle"
      color="transparent"
      @click.stop
    >
      <GlassCard
        @click.stop
        width="320"
        :max-height="maxCardHeight"
        :ripple="false"
        variant="panel"
        padding="pa-0"
        class="elevation-24"
        style="overflow: hidden; display: flex; flex-direction: column"
      >
        <v-card-title>{{ tooltip }}</v-card-title>
        <v-card-text class="pa-5" style="overflow-y: auto; flex: 1; min-height: 0">
          <slot name="options" />
        </v-card-text>
      </GlassCard>
    </v-sheet>
  </v-sheet>
</template>

<style scoped>
.menu-item-container {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.3s ease;
}

.menu-btn {
  background: transparent !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
}

.menu-btn::before {
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

.menu-btn:hover {
  transform: scale(1.1);
}

.menu-btn:hover::before {
  background: rgba(255, 255, 255, calc(var(--adaptive-opacity, 0.15) + 0.15));
}

.menu-btn.v-btn--active {
  background-color: v-bind(primaryColor) !important;
  color: white !important;
}

.menu-btn.v-btn--active::before {
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

.menu-btn.v-btn--active ::v-deep(.v-img__img) {
  filter: invert(100%);
}

.menu-options {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1001;
}

.options-right {
  left: 60px;
}

.options-left {
  right: 60px;
}
</style>
