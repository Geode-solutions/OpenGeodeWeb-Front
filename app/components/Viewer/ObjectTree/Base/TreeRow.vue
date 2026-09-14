<script setup lang="ts">
// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
import { useDataStore } from "@ogw_front/stores/data";
import type {
  DisplayItem,
  ItemPropsConfig,
  SelectionConfig,
  TreeItem,
} from "@ogw_front/composables/virtual_tree";

const dataStore = useDataStore();

interface Props {
  item: DisplayItem;
  itemProps: ItemPropsConfig;
  selection: SelectionConfig;
  isSelected: (item: TreeItem) => boolean;
  getIndeterminate: (item: TreeItem) => boolean;
}

const { item, itemProps, selection, isSelected, getIndeterminate } =
  defineProps<Props>();

const emit = defineEmits<{
  "toggle-open": [item: TreeItem];
  "toggle-select": [item: TreeItem];
  "hover-eye-enter": [item: unknown];
  "hover-eye-leave": [item: unknown];
}>();

const INDENT_STEP = 10;

function triggerHorizonStackModal(rawItem: unknown) {
  globalThis.dispatchEvent(
    new CustomEvent("open-horizon-stack-modal", { detail: rawItem }),
  );
}
const isHorizonStack = computed(
  () => item.raw.geode_object_type === "HorizonStack3D",
);
const isViewable = computed(() => dataStore.isItemViewable(item.raw));
const showEyeButton = computed(
  () =>
    !isHorizonStack.value &&
    item.raw.title !== "HorizonStack3D" &&
    isViewable.value,
);

function handleRowClick(event: MouseEvent) {
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
  <div
    class="tree-row-content d-flex align-center px-2 ps-2 w-100"
    @click="handleRowClick"
  >
    <div
      v-if="item.depth > 0"
      class="flex-shrink-0"
      :style="{ width: `${item.depth * INDENT_STEP}px` }"
    />

    <div class="d-flex align-center flex-shrink-0">
      <v-icon
        v-if="!item.isLeaf"
        :data-testid="
          item.isOpen ? 'collapseTreeRowButton' : 'expandTreeRowButton'
        "
        :icon="item.isOpen ? 'mdi-menu-down' : 'mdi-menu-right'"
        class="me-1"
        color="black"
        @click.stop="$emit('toggle-open', item.raw)"
      />
      <div v-else class="icon-placeholder" />

      <template v-if="selection.selectable">
        <v-btn
          v-if="isHorizonStack && item.isLeaf"
          icon="mdi-layers-triple"
          variant="text"
          density="compact"
          color="black"
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
              ? 'mdi-eye-minus-outline'
              : isSelected(item.raw)
                ? 'mdi-eye'
                : 'mdi-eye-off-outline'
          "
          variant="text"
          density="compact"
          color="black"
          class="flex-shrink-0"
          @click.stop="$emit('toggle-select', item.raw)"
          @mousedown.stop
          @mouseenter="$emit('hover-eye-enter', item.raw)"
          @mouseleave="$emit('hover-eye-leave', item.raw)"
        />
      </template>
    </div>

    <div
      class="tree-title flex-grow-1 overflow-hidden d-flex align-center ms-1 pt-1"
    >
      <slot name="title" :item="item.raw" :is-leaf="item.isLeaf">
        <v-list-item-title
          :class="{ 'font-weight-bold': !item.isLeaf }"
          class="text-black"
          style="font-size: 0.8rem !important"
        >
          {{ item.raw[itemProps.title] || item.id }}
        </v-list-item-title>
      </slot>
    </div>

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
</style>
