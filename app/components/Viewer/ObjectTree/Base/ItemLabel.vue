<script setup>
import { middleTruncate } from "@ogw_front/utils/string";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

const feedbackStore = useFeedbackStore();

const { item, isLeaf } = defineProps({
  item: { type: Object, required: true },
  isLeaf: { type: Boolean, required: false, default: undefined },
});

const emit = defineEmits(["contextmenu", "mouseenter", "mouseleave"]);

const labelContainer = useTemplateRef("label-container");
const { width: containerWidth } = useElementSize(labelContainer);

const actualItem = computed(() => item.raw || item);

const UUID_END_CHARS = 12;
const ELLIPSIS_LENGTH = 3;
const MIN_START_CHARS = 4;

const displayTitle = computed(() => {
  const { title } = actualItem.value;
  if (!title) {
    return "";
  }

  // Estimate max characters based on width (approx 9px per char for typical font)
  // We subtract some padding/icon space
  const estimatedCharWidth = 8.5;
  const maxChars = Math.floor(containerWidth.value / estimatedCharWidth);

  // Only truncate if the text is longer than what fits
  if (title.length <= maxChars) {
    return title;
  }

  // Calculate dynamic start/end based on available space
  // For UUIDs, showing the last 12 characters is often useful
  const endChars = Math.min(UUID_END_CHARS, Math.floor(maxChars / ELLIPSIS_LENGTH));
  const startChars = Math.max(MIN_START_CHARS, maxChars - endChars - ELLIPSIS_LENGTH);

  return middleTruncate(title, maxChars, startChars, endChars);
});

const tooltipDisabled = computed(() => {
  if (isLeaf !== undefined) {
    return !isLeaf;
  }
  return actualItem.value.children && actualItem.value.children.length > 0;
});

async function copyToClipboard(text, label) {
  await navigator.clipboard.writeText(text);
  feedbackStore.add_success(`${label} copied to clipboard`);
}
</script>

<template>
  <div ref="label-container" class="tree-item-label-container w-100">
    <v-tooltip
      :disabled="tooltipDisabled"
      location="right"
      open-delay="400"
      close-delay="100"
      interactive
    >
      <template #activator="{ props: tooltipProps }">
        <span
          v-bind="tooltipProps"
          class="tree-item-label"
          :class="{ 'inactive-item': actualItem.is_active === false }"
          @contextmenu.prevent.stop="emit('contextmenu', $event)"
          @mouseenter="emit('mouseenter')"
          @mouseleave="emit('mouseleave')"
        >
          {{ displayTitle }}
        </span>
      </template>

      <div class="d-flex flex-column ga-1">
        <span class="text-caption d-flex align-center">
          <strong class="text-white mr-1">ID:</strong>
          <span>{{ actualItem.id }}</span>
          <v-btn
            icon="mdi-content-copy"
            variant="text"
            size="x-small"
            density="compact"
            class="ml-1 text-white"
            @click.stop="copyToClipboard(actualItem.id, 'ID')"
          />
        </span>
        <span v-if="actualItem.title" class="text-caption d-flex align-center">
          <strong class="text-white mr-1">Name:</strong>
          <span>{{ actualItem.title }}</span>
          <v-btn
            icon="mdi-content-copy"
            variant="text"
            size="x-small"
            density="compact"
            class="ml-1 text-white"
            @click.stop="copyToClipboard(actualItem.title, 'Name')"
          />
        </span>
        <span class="text-caption d-flex align-center">
          <strong class="text-white mr-1">Status:</strong>
          <i class="ml-1">{{ actualItem.is_active ? "Active" : "Inactive" }}</i>
        </span>
      </div>
    </v-tooltip>
  </div>
</template>

<style scoped>
.tree-item-label-container {
  display: flex;
  align-items: center;
  min-width: 0;
  height: 100%;
  width: 100%;
}

.tree-item-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.8rem;
}

.inactive-item {
  opacity: 0.4;
  font-style: italic;
}
</style>
