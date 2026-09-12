<script setup lang="ts">
import ColormapQuickPicker from "@ogw_front/components/Viewer/Options/ColormapQuickPicker.vue";
import HybridViewerTooltip from "@ogw_front/components/HybridViewerTooltip.vue";
import ViewToolbar from "@ogw_front/components/ViewToolbar.vue";

import { useDataStore } from "@ogw_front/stores/data";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useMenuStore } from "@ogw_front/stores/menu";
import { useQuickColormap } from "@ogw_front/composables/use_quick_colormap";
import { useViewerStore } from "@ogw_front/stores/viewer";

const DEFAULT_ELEMENT_HEIGHT = 100;

// oxlint-disable-next-line vue/define-emits-declaration
const emit = defineEmits(["click"]);

const container = useTemplateRef("viewer");
const hybridViewerStore = useHybridViewerStore();
const viewerStore = useViewerStore();
const menuStore = useMenuStore();
const dataStore = useDataStore();

const { width: elementWidth, height: elementHeight } = useElementSize(container);
const { width: windowWidth, height: windowHeight } = useWindowSize();

function debounce<Callback extends (...args: unknown[]) => void>(func: Callback, wait: number) {
  let timeout: ReturnType<typeof setTimeout> | undefined = undefined;
  return function executedFunction(...args: Parameters<Callback>) {
    function later() {
      clearTimeout(timeout);
      func(...args);
    }
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const debouncedResize = debounce(() => {
  hybridViewerStore.resize(elementWidth.value, elementHeight.value);
}, DEFAULT_ELEMENT_HEIGHT);

watch([elementWidth, elementHeight, windowWidth, windowHeight], (value) => {
  debouncedResize();
});

onMounted(async () => {
  if (import.meta.client) {
    await hybridViewerStore.initHybridViewer();
    await nextTick();
    // UseTemplateRef's inferred type is broader than the { $el: HTMLElement } shape
    // SetContainer expects; this element is only ever a component instance with $el
    // (see the `containerEl.$el` usages below).
    hybridViewerStore.setContainer(container as never);
    debouncedResize();
  }
});

const { pickColormap, quickColormap } = useQuickColormap();

async function handleClick(event: PointerEvent) {
  const { offsetX, offsetY, clientX, clientY } = event;
  // Only ever fired from the pointerup handler bound to this same element.
  const containerEl = container.value;
  if (!containerEl) {
    return;
  }

  if (hybridViewerStore.is_ruler_active) {
    const rect = containerEl.$el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = elementHeight.value - (event.clientY - rect.top);
    await hybridViewerStore.handleRulerClick(x, y);
    return;
  }

  if (viewerStore.picking_mode) {
    const rect = containerEl.$el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = elementHeight.value - (event.clientY - rect.top);
    await viewerStore.set_picked_point(x, y);
    return;
  }

  const picked = await pickColormap(offsetX, offsetY, clientX, clientY);
  if (picked) {
    return;
  }

  emit("click", event);
}
</script>

<template>
  <ClientOnly>
    <div data-testid="hybridViewer" class="fill-height" style="position: relative; height: 100%">
      <ColormapQuickPicker
        v-model:show="quickColormap.show"
        :x="quickColormap.x"
        :y="quickColormap.y"
        :data-id="quickColormap.data_id"
      />
      <ViewToolbar />
      <slot name="ui"></slot>
      <HybridViewerTooltip :container-width="elementWidth" :container-height="elementHeight" />
      <v-col
        class="pa-0"
        ref="viewer"
        :class="{ 'picking-cursor': viewerStore.picking_mode }"
        style="height: 100%; overflow: hidden; position: relative; z-index: 0"
        @pointerup.capture="handleClick"
      />
    </div>
  </ClientOnly>
</template>

<style>
[data-testid="hybridViewer"] img {
  pointer-events: none !important;
}
</style>

<style scoped>
.picking-cursor {
  cursor: crosshair !important;
}
</style>
