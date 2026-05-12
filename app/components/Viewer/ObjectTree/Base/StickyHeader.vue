<script setup>
import TreeRow from "@ogw_front/components/Viewer/ObjectTree/Base/TreeRow.vue";

const { item, itemProps, selection, isSelected, getIndeterminate } = defineProps({
  item: { type: Object, required: true },
  itemProps: { type: Object, required: true },
  selection: { type: Object, required: true },
  isSelected: { type: Function, required: true },
  getIndeterminate: { type: Function, required: true },
});

const emit = defineEmits(["toggle-open", "toggle-select"]);
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
  z-index: 20;
}

.sticky-tree-header:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
