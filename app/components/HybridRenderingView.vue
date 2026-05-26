<script setup>
import ColormapQuickPicker from "@ogw_front/components/Viewer/Options/ColormapQuickPicker.vue";
import HybridViewerTooltip from "@ogw_front/components/HybridViewerTooltip";
import ViewToolbar from "@ogw_front/components/ViewToolbar";
import { useDataStore } from "@ogw_front/stores/data";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useMenuStore } from "@ogw_front/stores/menu";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const DEFAULT_ELEMENT_HEIGHT = 100;

const emit = defineEmits(["click"]);

const container = useTemplateRef("viewer");
const hybridViewerStore = useHybridViewerStore();
const viewerStore = useViewerStore();
const menuStore = useMenuStore();
const dataStore = useDataStore();

const { width: elementWidth, height: elementHeight } =
  useElementSize(container);
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

const quickColormap = reactive({
  data_id: undefined,
  show: false,
  x: 0,
  y: 0,
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
  const { offsetX, offsetY, clientX, clientY } = event;
  if (viewerStore.picking_mode) {
    const rect = container.value.$el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = elementHeight.value - (event.clientY - rect.top);
    await viewerStore.set_picked_point(x, y);
    return;
  }

  try {
    const result = await viewerStore.request(
      viewer_schemas.opengeodeweb_viewer.viewer.pick_colormap,
      {
        x: offsetX,
        y: offsetY,
      },
    );
    if (result && result.data_id) {
      quickColormap.data_id = result.data_id;
      quickColormap.x = clientX;
      quickColormap.y = clientY;
      quickColormap.show = true;
      return;
    }
  } catch (error) {
    console.error("Error in pick_colormap:", error);
  }

  emit("click", event);
}
</script>

<template>
  <ClientOnly>
    <div
      data-testid="hybridViewer"
      class="fill-height"
      style="position: relative; height: 100%"
    >
      <ColormapQuickPicker
        v-model:show="quickColormap.show"
        :x="quickColormap.x"
        :y="quickColormap.y"
        :data-id="quickColormap.data_id"
      />
      <ViewToolbar />
      <slot name="ui"></slot>
      <HybridViewerTooltip
        :container-width="elementWidth"
        :container-height="elementHeight"
      />
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

<style scoped>
img {
  pointer-events: none;
}
.picking-cursor {
  cursor: crosshair !important;
}
</style>
