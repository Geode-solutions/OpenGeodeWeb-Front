<script setup>
import StickyHeader from "@ogw_front/components/Viewer/ObjectTree/Base/StickyHeader.vue";
import TreeRow from "@ogw_front/components/Viewer/ObjectTree/Base/TreeRow.vue";
import { useTreeScroll } from "@ogw_front/composables/use_tree_scroll";
import { useVirtualTree } from "@ogw_front/composables/use_virtual_tree";

const {
  items,
  itemProps = {},
  opened = [],
  selected = [],
  selection = {},
  search = "",
  customFilter = undefined,
  scrollTop = 0,
} = defineProps({
  items: { type: Array, required: true },
  itemProps: { type: Object },
  opened: { type: Array },
  selected: { type: Array },
  selection: { type: Object },
  search: { type: String },
  customFilter: { type: Function },
  scrollTop: { type: Number },
});

const emit = defineEmits([
  "update:opened",
  "update:selected",
  "click:item",
  "update:scrollTop",
  "item:mouseenter",
  "item:mouseleave",
]);

const {
  actualItemProps,
  actualSelection,
  displayItems,
  toggleOpen,
  toggleSelect,
  isSelected,
  getIndeterminate,
} = useVirtualTree(
  {
    items: () => items,
    itemProps: () => itemProps,
    opened: () => opened,
    selected: () => selected,
    selection: () => selection,
    search: () => search,
    customFilter: () => customFilter,
  },
  emit,
);

const { virtualScrollRef, stickyHeader, handleScroll } = useTreeScroll(
  () => scrollTop,
  emit,
  displayItems,
  actualItemProps,
);
</script>

<template>
  <div class="common-tree-view-wrapper">
    <StickyHeader
      v-if="stickyHeader"
      :item="stickyHeader"
      :item-props="actualItemProps"
      :selection="actualSelection"
      :is-selected="isSelected"
      :get-indeterminate="getIndeterminate"
      @toggle-open="toggleOpen"
      @toggle-select="toggleSelect"
      @mouseenter="emit('item:mouseenter', stickyHeader)"
      @mouseleave="emit('item:mouseleave', stickyHeader)"
    >
      <template #title="slotProps">
        <slot name="title" v-bind="slotProps" />
      </template>
    </StickyHeader>

    <v-virtual-scroll
      ref="virtualScrollRef"
      :items="displayItems"
      :item-height="actualItemProps.height"
      class="common-tree-view"
      @scroll="handleScroll"
    >
      <template #default="{ item }">
        <v-list-item
          :class="['tree-row-wrapper', { 'leaf-row': item.isLeaf }]"
          class="pa-0"
          @mouseenter="emit('item:mouseenter', item)"
          @mouseleave="emit('item:mouseleave', item)"
          @click="
            if (item.isLeaf) {
              toggleSelect(item.raw);
              emit('click:item', item.raw);
            } else {
              toggleOpen(item.raw);
            }
          "
        >
          <TreeRow
            :item="item"
            :item-props="actualItemProps"
            :selection="actualSelection"
            :is-selected="isSelected"
            :get-indeterminate="getIndeterminate"
            @toggle-open="toggleOpen"
            @toggle-select="toggleSelect"
          >
            <template #title="slotProps">
              <slot name="title" v-bind="slotProps" />
            </template>
            <template #append="slotProps">
              <slot name="append" v-bind="slotProps" />
            </template>
          </TreeRow>
        </v-list-item>
      </template>
    </v-virtual-scroll>
  </div>
</template>

<style scoped>
.common-tree-view-wrapper {
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.common-tree-view {
  flex-grow: 1;
  min-height: 0;
  overflow-y: auto !important;
}

.tree-row-wrapper {
  min-height: 44px !important;
  cursor: pointer;
}

:deep(.v-list-item__content) {
  padding: 0 !important;
  display: block !important;
}

:deep(.v-list-item__overlay) {
  display: none !important;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
