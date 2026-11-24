<script setup lang="ts">
import type {
  DisplayItem,
  ItemPropsConfig,
  SelectionConfig,
  TreeItem,
} from "@ogw_front/composables/virtual_tree";
import { useDataStore } from "@ogw_front/stores/data";

const dataStore = useDataStore();

interface Props {
  item: DisplayItem;
  itemProps: ItemPropsConfig;
  selection: SelectionConfig;
  isSelected: (item: TreeItem) => boolean;
  getIndeterminate: (item: TreeItem) => boolean;
}

const { item, itemProps, selection, isSelected, getIndeterminate } = defineProps<Props>();

interface Emits {
  "toggle-open": [item: TreeItem];
  "toggle-select": [item: TreeItem];
  "hover-eye-enter": [item: unknown];
  "hover-eye-leave": [item: unknown];
}

const emit = defineEmits<Emits>();

const INDENT_STEP = 10;

function triggerHorizonStackModal(rawItem: unknown): void {
  globalThis.dispatchEvent(new CustomEvent("open-horizon-stack-modal", { detail: rawItem }));
}
const isHorizonStack = computed<boolean>(() => item.raw.geode_object_type === "HorizonStack3D");
const isViewable = computed<boolean>(() => dataStore.isItemViewable(item.raw));
const showEyeButton = computed<boolean>(
  () => !isHorizonStack.value && item.raw.title !== "HorizonStack3D" && isViewable.value,
);

function isLoading(child: unknown): boolean {
  return (
    typeof child === "object" && child !== null && "loading" in child && child.loading === true
  );
}
const loadingChildren = computed<number>(() =>
  Array.isArray(item.raw.children)
    ? item.raw.children.filter((child) => isLoading(child)).length
    : 0,
);
// A data, or a group of data, that cannot be shown or hidden yet
const isRowLoading = computed<boolean>(
  () =>
    isLoading(item.raw) ||
    (Array.isArray(item.raw.children) &&
      loadingChildren.value > 0 &&
      loadingChildren.value === item.raw.children.length),
);
// A folded group shows that some of its data are still loading
const showGroupSpinner = computed<boolean>(
  () => !item.isOpen && loadingChildren.value > 0 && !isRowLoading.value,
);

function handleRowClick(event: MouseEvent): void {
  if (isHorizonStack.value) {
    if (!item.isLeaf) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();
    triggerHorizonStackModal(item.raw);
  }
}
</script>

<template>
  <div class="tree-row-content d-flex align-center px-2 ps-2 w-100" @click="handleRowClick">
    <div
      v-if="item.depth > 0"
      class="flex-shrink-0"
      :style="{ width: `${item.depth * INDENT_STEP}px` }"
    />

    <div class="d-flex align-center flex-shrink-0">
      <v-icon
        v-if="item.isExpandable"
        :data-testid="item.isOpen ? 'collapseTreeRowButton' : 'expandTreeRowButton'"
        :icon="item.isOpen ? 'ph-caret-down' : 'ph-caret-right'"
        :class="item.isLeaf ? 'icon-placeholder' : 'me-1'"
        @click.stop="$emit('toggle-open', item.raw)"
      />
      <div v-else class="icon-placeholder" />

      <template v-if="selection.selectable">
        <div
          v-if="isRowLoading"
          data-testid="loadingObjectSpinner"
          class="loading-spinner d-flex align-center justify-center flex-shrink-0"
        >
          <v-progress-circular indeterminate size="14" width="2" color="primary" />
        </div>
        <v-btn
          v-else-if="isHorizonStack && item.isLeaf"
          icon="ph-stack"
          variant="text"
          density="compact"
          class="flex-shrink-0"
          style="z-index: 4"
          @click.stop="triggerHorizonStackModal(item.raw)"
          @mousedown.stop
        />
        <v-btn
          v-else-if="showEyeButton"
          :data-testid="
            getIndeterminate(item.raw)
              ? 'indeterminateObjectEyeButton'
              : isSelected(item.raw)
                ? 'visibleObjectEyeButton'
                : 'hiddenObjectEyeButton'
          "
          :icon="
            getIndeterminate(item.raw)
              ? 'ph-eye'
              : isSelected(item.raw)
                ? 'ph-fill ph-eye'
                : 'ph-eye-slash'
          "
          variant="text"
          density="compact"
          class="flex-shrink-0"
          @click.stop="$emit('toggle-select', item.raw)"
          @mousedown.stop
          @mouseenter="$emit('hover-eye-enter', item.raw)"
          @mouseleave="$emit('hover-eye-leave', item.raw)"
        />
      </template>
    </div>

    <div class="tree-title flex-grow-1 overflow-hidden d-flex align-center ms-1 pt-1">
      <slot name="title" :item="item.raw" :is-leaf="item.isLeaf">
        <v-list-item-title
          :class="{ 'font-weight-bold': !item.isLeaf }"
          class="text-high-emphasis"
          style="font-size: 0.8rem !important"
        >
          {{ item.raw[itemProps.title] || item.id }}
        </v-list-item-title>
      </slot>
    </div>

    <v-progress-circular
      v-if="showGroupSpinner"
      data-testid="loadingGroupSpinner"
      indeterminate
      size="12"
      width="2"
      color="primary"
      class="flex-shrink-0 ms-2"
    />

    <div class="ms-auto d-flex align-center">
      <slot name="append" :item="item.raw" />
    </div>
  </div>
</template>

<style scoped>
.tree-row-content {
  min-height: 28px;
}

.icon-placeholder {
  width: 24px;
}

.tree-title {
  min-height: 24px;
}

/* Same footprint as the eye button it stands in for */
.loading-spinner {
  width: 28px;
  height: 28px;
}
</style>
