<script setup lang="ts">
import GlassCard from "@ogw_front/components/GlassCard.vue";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const TOOLTIP_SCREEN_MARGIN = 10;

const { containerWidth, containerHeight } = defineProps({
  containerWidth: {
    type: Number,
    required: true,
  },
  containerHeight: {
    type: Number,
    required: true,
  },
});

const hybridViewerStore = useHybridViewerStore();

const tooltipRef = useTemplateRef("tooltip");
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
  if (left + measuredTooltipWidth > containerWidth) {
    left = mouseX - measuredTooltipWidth - tooltipOffsetGap;
  }
  if (left < 0) {
    left = TOOLTIP_SCREEN_MARGIN;
  }

  let top = mouseY - measuredTooltipHeight - tooltipOffsetGap;
  if (top < 0) {
    top = mouseY + tooltipOffsetGap;
  }
  if (top + measuredTooltipHeight > containerHeight) {
    top = containerHeight - measuredTooltipHeight - TOOLTIP_SCREEN_MARGIN;
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
const RESERVED_ATTRIBUTE_KEYS = new Set([
  "coordinates",
  "vtkOriginalCellIds",
  "vtkOriginalPointIds",
]);

const hasOtherAttributes = computed(() => {
  const attributes = hybridViewerStore.hoverData?.attributes || {};
  return Object.keys(attributes).some(
    (key) => key !== "vtkOriginalCellIds" && key !== "vtkOriginalPointIds",
  );
});

const sortedAttributes = computed(() => {
  const attributes = hybridViewerStore.hoverData?.attributes || {};
  return (
    Object.entries(attributes)
      .filter(([key]) => !RESERVED_ATTRIBUTE_KEYS.has(key))
      // oxlint-disable-next-line unicorn/no-array-sort
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
  );
});

function capitalize(val: string) {
  if (!val) {
    return "";
  }
  const spaced = val.replaceAll("_", " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const fieldTypeLabel = computed(() => {
  const fieldType = hybridViewerStore.hoverData?.fieldType;
  return typeof fieldType === "string" ? capitalize(fieldType.toLowerCase()) : "";
});

const coordinates = computed<number[] | undefined>(() => {
  const value = hybridViewerStore.hoverData?.attributes.coordinates;
  return Array.isArray(value) ? (value as number[]) : undefined;
});

function formatAttributeValue(val: unknown) {
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
</script>

<template>
  <GlassCard
    v-if="hybridViewerStore.hoverData"
    ref="tooltip"
    variant="panel"
    padding="pa-3"
    rounded="lg"
    class="floating-tooltip"
    :style="tooltipStyle"
  >
    <v-container fluid class="pa-0 tooltip-container">
      <v-row no-gutters class="flex-column ga-1">
        <v-col>
          <span class="tooltip-label">Name:</span>
          <span class="tooltip-value">
            {{
              hybridViewerStore.hoverData.component?.name ||
              hybridViewerStore.hoverData.component?.id ||
              hybridViewerStore.hoverData.blockName ||
              hybridViewerStore.hoverData.modelName ||
              `${fieldTypeLabel} #${hybridViewerStore.hoverData.pickedId}`
            }}
          </span>
        </v-col>
        <v-col>
          <span class="tooltip-label">Id:</span>
          <span class="tooltip-value-dim font-mono">
            {{ hybridViewerStore.hoverData.component?.id || hybridViewerStore.hoverData.modelId }}
          </span>
        </v-col>
        <v-col v-if="originalIndex !== undefined">
          <span class="tooltip-label">Index:</span>
          <span class="tooltip-value font-mono">
            {{ originalIndex }}
          </span>
        </v-col>
        <v-col v-if="hybridViewerStore.hoverData.component?.type">
          <span class="tooltip-label">Type:</span>
          <span class="tooltip-value">
            {{ hybridViewerStore.hoverData.component.type }}
          </span>
        </v-col>
      </v-row>
      <template v-if="hasOtherAttributes">
        <v-divider class="my-2" opacity="0.15" />
        <v-row no-gutters class="flex-column ga-1">
          <v-col v-if="coordinates" class="d-flex justify-space-between ga-3">
            <span class="tooltip-label">Position:</span>
            <span class="tooltip-value font-mono">
              [ {{ Number(coordinates[0]).toFixed(3) }}, {{ Number(coordinates[1]).toFixed(3) }},
              {{ Number(coordinates[2]).toFixed(3) }} ]
            </span>
          </v-col>
          <template v-for="[name, val] in sortedAttributes" :key="name">
            <v-col class="d-flex justify-space-between ga-3">
              <span class="tooltip-label">{{ capitalize(name) }}:</span>
              <span class="tooltip-value font-mono">
                {{ formatAttributeValue(val) }}
              </span>
            </v-col>
          </template>
        </v-row>
      </template>
    </v-container>
  </GlassCard>
</template>

<style scoped>
.floating-tooltip {
  position: absolute;
  pointer-events: none;
  z-index: 4;
  min-width: 200px;
  max-width: max-content;
  transition: opacity 0.15s ease;
}
.font-mono {
  font-family: monospace !important;
}
.tooltip-container {
  min-width: 220px;
  color: white;
  font-size: 0.875rem;
}
.tooltip-label {
  color: #bdbdbd;
  font-weight: bold;
  white-space: nowrap;
}
.tooltip-value {
  color: #a7ffeb;
  font-weight: 500;
  white-space: nowrap;
}
.tooltip-value-dim {
  color: #eeeeee;
  font-size: 0.75rem !important;
}
.tooltip-label + .tooltip-value,
.tooltip-label + .tooltip-value-dim {
  margin-left: 4px;
}
.justify-space-between > .tooltip-value {
  margin-left: 0 !important;
}
</style>
