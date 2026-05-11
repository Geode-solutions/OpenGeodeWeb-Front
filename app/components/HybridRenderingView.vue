<script setup>
import ViewToolbar from "@ogw_front/components/ViewToolbar";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";

const DEFAULT_ELEMENT_HEIGHT = 100;

const emit = defineEmits(["click"]);

const container = useTemplateRef("viewer");
const hybridViewerStore = useHybridViewerStore();
const viewerStore = useViewerStore();

const { width: elementWidth, height: elementHeight } = useElementSize(container);
const { width: windowWidth, height: windowHeight } = useWindowSize();

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
    hybridViewerStore.setContainer(container);
    debouncedResize();
  }
});

function debounce(func, wait) {
  let timeout = undefined;
  return function executedFunction(...args) {
    function later() {
      clearTimeout(timeout);
      func(...args);
    }
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

async function handleClick(event) {
  if (viewerStore.picking_mode) {
    const rect = container.value.$el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = elementHeight.value - (event.clientY - rect.top);
    await viewerStore.set_picked_point(x, y);
    return;
  }
  emit("click", event);
}
</script>

<template>
  <ClientOnly>
    <div data-testid="hybridViewer" class="fill-height" style="position: relative; height: 100%">
      <ViewToolbar />
      <slot name="ui"></slot>
      <v-col
        class="pa-0"
        ref="viewer"
        style="height: 100%; overflow: hidden; position: relative; z-index: 0"
        @click="handleClick"
      />
    </div>
  </ClientOnly>
</template>

<style>
img {
  pointer-events: none;
}
</style>
