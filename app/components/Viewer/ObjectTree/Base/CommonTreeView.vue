<script setup>
import StickyHeader from "@ogw_front/components/Viewer/ObjectTree/Base/StickyHeader.vue";
import TreeRow from "@ogw_front/components/Viewer/ObjectTree/Base/TreeRow.vue";
import { useTreeKeyboardNav } from "@ogw_front/composables/tree_keyboard_nav";
import { useTreeScroll } from "@ogw_front/composables/tree_scroll";
import { useVirtualTree } from "@ogw_front/composables/virtual_tree";

const { items, opened, selected, scrollTop, options } = defineProps({
  items: { type: Array, required: true },
  opened: { type: Array, required: false, default: () => [] },
  selected: { type: Array, required: false, default: () => [] },
  scrollTop: { type: Number, required: false, default: 0 },
  options: { type: Object, required: false, default: () => ({}) },
});

const treeWrapper = ref(undefined);

const emit = defineEmits([
  "update:opened",
  "update:selected",
  "click:item",
  "update:scrollTop",
  "hover:enter",
  "hover:leave",
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
  computed(() => ({
    items,
    opened,
    selected,
    ...options,
  })),
  emit,
);

const { virtualScrollRef, stickyHeader, handleScroll, scrollToIndex } = useTreeScroll(
  computed(() => ({ scrollTop })),
  emit,
  displayItems,
  actualItemProps,
);

function handleItemClick(item, index) {
  if (index !== undefined) {
    focusedIndex.value = index;
  }
  if (item.isLeaf) {
    toggleSelect(item.raw);
    emit("click:item", item.raw);
  } else {
    toggleOpen(item.raw);
  }
}

const { focusedIndex, handleKeyDown } = useTreeKeyboardNav(
  displayItems,
  emit,
  scrollToIndex,
  toggleOpen,
  handleItemClick,
);
</script>

<template>
  <div
    ref="treeWrapper"
    class="common-tree-view-wrapper"
    tabindex="0"
    @keydown="handleKeyDown"
    @mousedown="treeWrapper.focus()"
  >
    <StickyHeader
      v-if="stickyHeader"
      :item="stickyHeader"
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
    </StickyHeader>

    <v-virtual-scroll
      ref="virtualScrollRef"
      :items="displayItems"
      :item-height="actualItemProps.height"
      class="common-tree-view"
      @scroll="handleScroll"
    >
      <template #default="{ item, index }">
        <v-list-item
          :class="[
            'tree-row-wrapper',
            { 'leaf-row': item.isLeaf, 'is-focused': focusedIndex === index },
          ]"
          class="pa-0"
          tabindex="-1"
          @mousedown.prevent
          @click="
            handleItemClick(item, index);
            treeWrapper.focus();
          "
          @mouseenter="emit('hover:enter', { item })"
          @mouseleave="emit('hover:leave', { item })"
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

.common-tree-view-wrapper:focus {
  outline: none;
}

.common-tree-view {
  flex-grow: 1;
  min-height: 0;
  overflow-y: auto !important;
}

.v-list-item {
  background-color: transparent !important;
  transition: none !important;
}

.tree-row-wrapper {
  min-height: 44px !important;
  cursor: pointer;
  border-radius: 8px;
  margin: 1px 4px;
}

.tree-row-wrapper.is-focused {
  background-color: rgba(0, 0, 0, 0.08) !important;
  box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.15);
}

.tree-row-wrapper:hover:not(.is-focused) {
  background-color: rgba(0, 0, 0, 0.04) !important;
}

:deep(.v-list-item__content) {
  padding: 0 !important;
  display: block !important;
}

:deep(.v-list-item__overlay) {
  display: none !important;
}
</style>
