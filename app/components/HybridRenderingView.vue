<script setup>
import GlassCard from "@ogw_front/components/GlassCard";
import ViewToolbar from "@ogw_front/components/ViewToolbar";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";

const DEFAULT_ELEMENT_HEIGHT = 100;
const TOOLTIP_SCREEN_MARGIN = 10;

const emit = defineEmits(["click"]);

const container = useTemplateRef("viewer");
const hybridViewerStore = useHybridViewerStore();
const viewerStore = useViewerStore();

const { width: elementWidth, height: elementHeight } = useElementSize(container);
const { width: windowWidth, height: windowHeight } = useWindowSize();

const tooltipRef = ref(undefined);
const { width: tooltipWidth, height: tooltipHeight } = useElementSize(tooltipRef);

const tooltipStyle = computed(() => {
  if (!hybridViewerStore.hoverData) {
    return {};
  }
  const mouseX = hybridViewerStore.hoverPosition.x;
  const mouseY = hybridViewerStore.hoverPosition.y;
  const measuredTooltipWidth = tooltipWidth.value;
  const measuredTooltipHeight = tooltipHeight.value;
  const tooltipOffsetGap = 20;

  let left = mouseX + tooltipOffsetGap;
  if (left + measuredTooltipWidth > elementWidth.value) {
    left = mouseX - measuredTooltipWidth - tooltipOffsetGap;
  }
  if (left < 0) {
    left = TOOLTIP_SCREEN_MARGIN;
  }

  let top = mouseY - measuredTooltipHeight - tooltipOffsetGap;
  if (top < 0) {
    top = mouseY + tooltipOffsetGap;
  }
  if (top + measuredTooltipHeight > elementHeight.value) {
    top = elementHeight.value - measuredTooltipHeight - TOOLTIP_SCREEN_MARGIN;
  }

  return {
    left: `${left}px`,
    top: `${top}px`,
  };
});
const originalIndex = computed(() => {
  const attributes = hybridViewerStore.hoverData?.attributes || {};
  const originalId =
    attributes.vtkOriginalCellIds ??
    attributes.vtkOriginalPointIds ??
    hybridViewerStore.hoverData?.pickedId;
  if (originalId === undefined) {
    return undefined;
  }
  return Math.floor(Number(originalId));
});

const hasOtherAttributes = computed(() => {
  const attributes = hybridViewerStore.hoverData?.attributes || {};
  return Object.keys(attributes).some(
    (key) => key !== "vtkOriginalCellIds" && key !== "vtkOriginalPointIds",
  );
});

function capitalize(val) {
  if (!val) {
    return "";
  }
  const spaced = val.replaceAll("_", " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatAttributeValue(val) {
  if (Array.isArray(val)) {
    const formattedValues = val.map((value) => {
      if (typeof value === "number") {
        if (Number.isInteger(value)) {
          return String(value);
        }
        return Number(value).toFixed(3);
      }
      return value;
    });
    return `[ ${formattedValues.join(", ")} ]`;
  }
  if (typeof val === "number") {
    return Number.isInteger(val) ? String(val) : Number(val).toFixed(4);
  }
  return val;
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

      <GlassCard
        v-if="hybridViewerStore.hoverData"
        ref="tooltipRef"
        variant="panel"
        padding="pa-3"
        rounded="lg"
        class="floating-tooltip"
        :style="tooltipStyle"
      >
        <div class="d-flex flex-column ga-1.5 text-white text-caption" style="min-width: 220px">
          <!-- Main Details -->
          <div class="d-flex flex-column ga-1">
            <!-- Name -->
            <div>
              <span class="text-grey-lighten-1 font-weight-bold">Name:</span>
              <span class="ml-1 text-teal-accent-1 font-weight-medium">
                {{
                  hybridViewerStore.hoverData.component?.name ||
                  hybridViewerStore.hoverData.component?.id ||
                  hybridViewerStore.hoverData.blockName ||
                  hybridViewerStore.hoverData.modelName ||
                  `${capitalize(hybridViewerStore.hoverData.fieldType.toLowerCase())} #${hybridViewerStore.hoverData.pickedId}`
                }}
              </span>
            </div>

            <!-- Id -->
            <div>
              <span class="text-grey-lighten-1 font-weight-bold">Id:</span>
              <span
                class="ml-1 text-grey-lighten-2 font-mono text-caption"
                style="font-size: 0.75rem !important"
              >
                {{
                  hybridViewerStore.hoverData.component?.id || hybridViewerStore.hoverData.modelId
                }}
              </span>
            </div>

            <!-- Index -->
            <div v-if="originalIndex !== undefined">
              <span class="text-grey-lighten-1 font-weight-bold">Index:</span>
              <span class="ml-1 text-teal-accent-1 font-weight-medium font-mono">
                {{ originalIndex }}
              </span>
            </div>

            <!-- Type -->
            <div v-if="hybridViewerStore.hoverData.component?.type">
              <span class="text-grey-lighten-1 font-weight-bold">Type:</span>
              <span class="ml-1 text-teal-accent-1 font-weight-medium">
                {{ hybridViewerStore.hoverData.component.type }}
              </span>
            </div>
          </div>

          <!-- Separator & Attributes -->
          <div
            v-if="hasOtherAttributes"
            class="border-top pt-2 mt-1"
            style="border-color: rgba(255, 255, 255, 0.1) !important"
          >
            <div class="d-flex flex-column ga-1">
              <!-- Coordinates -->
              <div
                v-if="hybridViewerStore.hoverData.attributes.coordinates"
                class="d-flex justify-space-between ga-3"
              >
                <span class="text-grey-lighten-1 font-weight-bold">Position:</span>
                <span class="text-teal-accent-1 font-weight-medium font-mono">
                  [ {{ Number(hybridViewerStore.hoverData.attributes.coordinates[0]).toFixed(3) }},
                  {{ Number(hybridViewerStore.hoverData.attributes.coordinates[1]).toFixed(3) }},
                  {{ Number(hybridViewerStore.hoverData.attributes.coordinates[2]).toFixed(3) }} ]
                </span>
              </div>

              <!-- Custom scalar fields -->
              <template v-for="(val, name) in hybridViewerStore.hoverData.attributes" :key="name">
                <div
                  v-if="
                    name !== 'coordinates' &&
                    name !== 'vtkOriginalCellIds' &&
                    name !== 'vtkOriginalPointIds'
                  "
                  class="d-flex justify-space-between ga-3"
                >
                  <span class="text-grey-lighten-1 font-weight-bold">{{ capitalize(name) }}:</span>
                  <span class="text-teal-accent-1 font-weight-medium font-mono">
                    {{ formatAttributeValue(val) }}
                  </span>
                </div>
              </template>
            </div>
          </div>
        </div>
      </GlassCard>

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
  position: absolute;
  pointer-events: none;
  z-index: 10000;
  min-width: 200px;
  max-width: 450px;
  transition: opacity 0.15s ease;
}
.font-mono {
  font-family: monospace !important;
}
</style>
