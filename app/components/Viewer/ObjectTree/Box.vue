<script setup lang="ts">
import { useAdaptiveStyles } from "@ogw_front/composables/use_adaptive_styles";

const SCROLL_SYNC_DELAY = 50;
const SCROLL_THRESHOLD = 1;
interface Props {
  title: string;
  closable?: boolean;
  icon?: string;
  fontIcon?: string;
  scrollTop?: number;
  borderRadius?: string;
  borderLeft?: boolean;
  // Ties the box to its row in the objects tree, highlighted while either is hovered
  accent?: { color: string; highlighted: boolean };
}

const {
  title,
  closable = false,
  icon = "",
  fontIcon = "",
  scrollTop = 0,
  borderRadius = "var(--ogw-viewer-panel-radius, 16px)",
  borderLeft = true,
  accent = undefined,
} = defineProps<Props>();

const slots = useSlots();

interface Emits {
  close: [];
  dragstart: [event: DragEvent];
  "update:scrollTop": [value: number];
  "header-enter": [];
  "header-leave": [];
}

const emit = defineEmits<Emits>();

const scrollContainer = useTemplateRef("scroll-container");
const treeviewBox = useTemplateRef("treeview-box");

const { adaptiveStyles } = useAdaptiveStyles(treeviewBox);

let isApplyingScroll = false;
let resizeObserver: ResizeObserver | undefined = undefined;

function handleScroll(event: Event): void {
  if (isApplyingScroll) {
    return;
  }
  emit("update:scrollTop", (event.target as HTMLElement).scrollTop);
}

function applyScrollTop(val: number): void {
  if (scrollContainer.value) {
    isApplyingScroll = true;
    scrollContainer.value.scrollTop = val;
    setTimeout(() => {
      isApplyingScroll = false;
    }, SCROLL_SYNC_DELAY);
  }
}

onMounted(() => {
  if (scrollContainer.value) {
    applyScrollTop(scrollTop);

    resizeObserver = new ResizeObserver(() => {
      if (
        scrollContainer.value &&
        Math.abs(scrollContainer.value.scrollTop - scrollTop) > SCROLL_THRESHOLD
      ) {
        applyScrollTop(scrollTop);
      }
    });

    resizeObserver.observe(scrollContainer.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

watch(
  () => scrollTop,
  (newVal) => {
    if (
      scrollContainer.value &&
      Math.abs(scrollContainer.value.scrollTop - newVal) > SCROLL_THRESHOLD
    ) {
      applyScrollTop(newVal);
    }
  },
);
</script>

<template>
  <v-card
    ref="treeview-box"
    variant="outlined"
    class="tree-box d-flex flex-column"
    :class="{ 'is-highlighted': accent?.highlighted }"
    :style="[
      adaptiveStyles,
      { borderRadius, borderLeft: borderLeft ? undefined : 'none' },
      accent ? { '--tree-box-accent': accent.color } : {},
    ]"
  >
    <div v-if="accent" data-testid="treeBoxAccent" class="tree-box-accent" />
    <v-card-title
      class="tree-box-header d-flex align-center"
      :class="{ 'cursor-grab': closable }"
      :draggable="closable"
      @dragstart="emit('dragstart', $event)"
      @mouseenter="emit('header-enter')"
      @mouseleave="emit('header-leave')"
    >
      <v-img
        v-if="icon"
        :src="icon"
        width="24"
        height="24"
        max-width="24"
        class="mr-2"
        style="
          filter: var(--ogw-mono-icon-filter, brightness(0));
          display: flex;
          align-items: center;
        "
      />
      <v-icon v-else-if="fontIcon" size="24" class="mr-2">{{ fontIcon }}</v-icon>
      <v-icon v-else-if="closable" size="24" class="mr-2">ph-dots-six-vertical</v-icon>
      <v-tooltip :disabled="!slots.tooltip" location="bottom start" open-delay="400">
        <template #activator="{ props: tooltipProps }">
          <span
            v-bind="tooltipProps"
            data-testid="treeBoxTitle"
            class="text-subtitle-2 font-weight-bold d-inline-flex align-center"
            style="
              height: 24px;
              line-height: 1;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              flex-shrink: 1;
              min-width: 0;
            "
          >
            {{ title }}
          </span>
        </template>
        <slot name="tooltip" />
      </v-tooltip>
      <v-spacer />
      <v-btn v-if="closable" icon="ph-x" variant="text" size="x-small" @click="emit('close')" />
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-0 flex-grow-1 overflow-hidden d-flex flex-column" style="min-height: 0">
      <div
        ref="scroll-container"
        class="flex-grow-1 overflow-y-hidden overflow-x-hidden d-flex flex-column"
        style="min-height: 0"
        @scroll="handleScroll"
      >
        <slot />
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.tree-box {
  height: 100%;
  min-height: 0;
  background-color: transparent !important;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  box-shadow: 0 4px 15px rgba(var(--v-theme-on-surface), 0.05);
  position: relative;
  overflow: hidden;
  transition:
    background-color 0.3s ease,
    backdrop-filter 0.3s ease;
}

.tree-box::before {
  content: "";
  position: absolute;
  inset: 0;
  /* Adaptive glass: apps can tint it (an "r, g, b" triplet), change its blending and set a minimum opacity, per
     theme (the radial menu's one) */
  background: rgba(
    var(--ogw-viewer-glass-tint, 255, 255, 255),
    max(var(--adaptive-opacity), var(--ogw-viewer-glass-min-opacity, 0))
  );
  backdrop-filter: blur(var(--adaptive-blur)) brightness(var(--adaptive-brightness));
  -webkit-backdrop-filter: blur(var(--adaptive-blur)) brightness(var(--adaptive-brightness));
  mix-blend-mode: var(--ogw-viewer-glass-blend, lighten);
  z-index: 0;
  pointer-events: none;
  border-radius: inherit;
  transition:
    background-color 0.3s ease,
    backdrop-filter 0.3s ease;
}

.tree-box > * {
  position: relative;
  z-index: 1;
}

.tree-box-accent {
  position: absolute;
  z-index: 2;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: var(--tree-box-accent);
  pointer-events: none;
}

.tree-box.is-highlighted {
  border-color: var(--tree-box-accent) !important;
  box-shadow:
    inset 0 0 0 2px var(--tree-box-accent),
    0 4px 15px rgba(var(--v-theme-on-surface), 0.05);
}

.tree-box.is-highlighted .tree-box-header {
  background-color: color-mix(in srgb, var(--tree-box-accent) 18%, transparent);
}

.tree-box-header {
  height: 32px !important;
  padding: 0 var(--ogw-viewer-panel-padding, 10px) !important;
  background-color: rgba(var(--v-theme-surface), 0.05);
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05);
  flex-shrink: 0;
  font-size: 0.875rem !important;
  line-height: 1.25rem !important;
}
</style>
