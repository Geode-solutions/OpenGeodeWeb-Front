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
      
      <!-- Floating Hover Tooltip -->
      <v-card
        v-if="hybridViewerStore.hoverData"
        class="floating-tooltip pa-3 rounded-lg"
        :style="{
          left: `${hybridViewerStore.hoverPosition.x}px`,
          top: `${hybridViewerStore.hoverPosition.y}px`
        }"
      >
        <div class="d-flex flex-column ga-2 text-white">
          <!-- Component Header -->
          <div class="d-flex align-center border-bottom pb-1 mb-1" style="border-color: rgba(255,255,255,0.1) !important">
            <v-icon
              :icon="
                hybridViewerStore.hoverData.component?.type === 'Block'
                  ? 'mdi-cube-outline'
                  : hybridViewerStore.hoverData.component?.type === 'Surface'
                    ? 'mdi-vector-square'
                    : hybridViewerStore.hoverData.component?.type === 'Line'
                      ? 'mdi-vector-line'
                      : hybridViewerStore.hoverData.component?.type === 'Corner'
                        ? 'mdi-vector-point'
                        : hybridViewerStore.hoverData.fieldType === 'CELL'
                          ? 'mdi-hexagon-outline'
                          : 'mdi-dots-hexagon'
              "
              size="small"
              class="mr-2 text-teal-accent-2"
            />
            <span class="font-weight-bold text-subtitle-2">
              {{ hybridViewerStore.hoverData.component?.name || `${hybridViewerStore.hoverData.fieldType} #${hybridViewerStore.hoverData.pickedId}` }}
            </span>
          </div>

          <!-- Component Details -->
          <div v-if="hybridViewerStore.hoverData.component" class="text-caption d-flex flex-column ga-1">
            <div>
              <span class="text-grey-lighten-1">Type:</span>
              <span class="ml-1 text-teal-accent-1 font-weight-medium">{{ hybridViewerStore.hoverData.component.type }}</span>
            </div>
            <div>
              <span class="text-grey-lighten-1">ID:</span>
              <span class="ml-1 text-grey-lighten-2 font-mono text-caption" style="font-size: 0.75rem !important">
                {{ hybridViewerStore.hoverData.component.id }}
              </span>
            </div>
          </div>

          <!-- Attributes and Coordinates -->
          <div
            v-if="Object.keys(hybridViewerStore.hoverData.attributes).length > 0"
            class="text-caption d-flex flex-column ga-1 border-top pt-2 mt-1"
            style="border-color: rgba(255,255,255,0.1) !important"
          >
            <!-- Coordinates -->
            <div v-if="hybridViewerStore.hoverData.attributes.coordinates" class="d-flex flex-column ga-0.5">
              <span class="text-grey-lighten-1 font-weight-bold">Position:</span>
              <div class="pl-2 font-mono text-grey-lighten-2 d-flex ga-2" style="font-size: 0.75rem !important">
                <span>X: {{ Number(hybridViewerStore.hoverData.attributes.coordinates[0]).toFixed(3) }}</span>
                <span>Y: {{ Number(hybridViewerStore.hoverData.attributes.coordinates[1]).toFixed(3) }}</span>
                <span>Z: {{ Number(hybridViewerStore.hoverData.attributes.coordinates[2]).toFixed(3) }}</span>
              </div>
            </div>

            <!-- Custom scalar fields/attributes -->
            <template v-for="(val, name) in hybridViewerStore.hoverData.attributes" :key="name">
              <div v-if="name !== 'coordinates'" class="d-flex justify-space-between ga-3">
                <span class="text-grey-lighten-1">{{ name }}:</span>
                <span class="text-teal-accent-1 font-weight-medium font-mono">
                  {{ typeof val === 'number' ? Number(val).toFixed(4) : val }}
                </span>
              </div>
            </template>
          </div>
        </div>
      </v-card>

      <v-col
        class="pa-0"
        ref="viewer"
        :class="{ 'picking-cursor': viewerStore.picking_mode }"
        style="height: 100%; overflow: hidden; position: relative; z-index: 0"
        @click="handleClick"
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
.floating-tooltip {
  position: fixed;
  pointer-events: none;
  z-index: 10000;
  transform: translate(-50%, -100%);
  margin-top: -15px;
  min-width: 200px;
  max-width: 320px;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.4) !important;
  background: rgba(30, 30, 30, 0.85) !important;
  backdrop-filter: blur(15px) saturate(1.2) !important;
  -webkit-backdrop-filter: blur(15px) saturate(1.2) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}
.font-mono {
  font-family: monospace !important;
}
</style>
