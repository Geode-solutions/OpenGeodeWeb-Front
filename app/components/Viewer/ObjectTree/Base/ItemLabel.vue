<script setup>
import { middleTruncate } from "@ogw_front/utils/string";
import { useClipboard } from "@vueuse/core";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { useResponsiveMiddleTruncate } from "@ogw_front/composables/responsive_middle_truncate";

const feedbackStore = useFeedbackStore();
const { copy } = useClipboard();

const { item, isLeaf } = defineProps({
  item: { type: Object, required: true },
  isLeaf: { type: Boolean, required: false, default: undefined },
});

const emit = defineEmits(["contextmenu", "mouseenter", "mouseleave"]);

const labelContainer = useTemplateRef("label-container");
const { width: containerWidth } = useElementSize(labelContainer);

const actualItem = computed(() => item.raw || item);

const TOOLTIP_NAME_MAX_LENGTH = 40;
const TOOLTIP_NAME_START_CHARS = 10;
const TOOLTIP_NAME_END_CHARS = 8;

const displayTitle = useResponsiveMiddleTruncate(() => actualItem.value.title, containerWidth);

const tooltipTitle = computed(() =>
  middleTruncate(
    actualItem.value.title,
    TOOLTIP_NAME_MAX_LENGTH,
    TOOLTIP_NAME_START_CHARS,
    TOOLTIP_NAME_END_CHARS,
  ),
);

const tooltipDisabled = computed(() => {
  if (isLeaf !== undefined) {
    return !isLeaf;
  }
  return actualItem.value.children && actualItem.value.children.length > 0;
});

async function copyToClipboard(text, label) {
  await copy(text);
  feedbackStore.add_success(`${label} copied to clipboard`);
}
</script>

<template>
  <div
    ref="label-container"
    :data-testid="'treeRow-' + actualItem.id"
    class="tree-item-label-container w-100"
  >
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
          data-testid="treeItemLabel"
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
            data-testid="copyIdBtn"
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
          <span>{{ tooltipTitle }}</span>
          <v-btn
            data-testid="copyNameBtn"
            icon="mdi-content-copy"
            variant="text"
            size="x-small"
            density="compact"
            class="ml-1 text-white"
            @click.stop="copyToClipboard(actualItem.title, 'Name')"
          />
        </span>
        <span v-if="actualItem.is_active !== undefined" class="text-caption d-flex align-center">
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
