<template>
  <ClientOnly>
    <div class="fill-height" style="position: relative;">
      <VeaseViewToolbar />
      <slot name="ui"></slot>
      <v-col
        ref="viewer"
        style="overflow: hidden; position: relative; z-index: 0;"
        :style="{ height: viewerHeight }"
        @click="get_x_y"
        @keydown.esc="viewer_store.toggle_picking_mode(false)"
      />
    </div>
  </ClientOnly>
</template>

<script setup>
const props = defineProps({
  height: {
    type: String,
    default: '100%',  
  },
});

const container = useTemplateRef('viewer');
const hybridViewerStore = useHybridViewerStore();
const viewer_store = use_viewer_store();  
const { windowWidth, windowHeight } = useWindowSize();
const { width, height } = useElementSize(container);

const viewerHeight = computed(() => props.height);

const debouncedResize = debounce(() => {
  hybridViewerStore.resize(width.value, height.value);
}, 100);

watch([windowWidth, windowHeight, width, height], () => {
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
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function get_x_y(event) {
  emit('click', event);
}

defineEmits(['click']);
</script>