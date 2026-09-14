<script setup lang="ts">
// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
import TreeRow from "@ogw_front/components/Viewer/ObjectTree/Base/TreeRow.vue";
import type {
  DisplayItem,
  ItemPropsConfig,
  SelectionConfig,
  TreeItem,
} from "@ogw_front/composables/virtual_tree";

interface Props {
  item: DisplayItem;
  itemProps: ItemPropsConfig;
  selection: SelectionConfig;
  isSelected: (item: TreeItem) => boolean;
  getIndeterminate: (item: TreeItem) => boolean;
}

const { item, itemProps, selection, isSelected, getIndeterminate } = defineProps<Props>();

const emit = defineEmits<{
  "toggle-open": [item: TreeItem];
  "toggle-select": [item: TreeItem];
}>();
</script>

<template>
  <div class="sticky-tree-header tree-row" @click="$emit('toggle-open', item.raw)">
    <TreeRow
      :item="item"
      :item-props="itemProps"
      :selection="selection"
      :is-selected="isSelected"
      :get-indeterminate="getIndeterminate"
      @toggle-open="$emit('toggle-open', $event)"
      @toggle-select="$emit('toggle-select', $event)"
    >
      <template #title="slotProps">
        <slot name="title" v-bind="slotProps" />
      </template>
    </TreeRow>
  </div>
</template>

<style scoped>
.sticky-tree-header {
  flex-shrink: 0;
  background-color: transparent;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  z-index: 2;
}

.sticky-tree-header:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
