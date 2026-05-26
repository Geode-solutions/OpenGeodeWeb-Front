<script setup>
import StickyHeader from "@ogw_front/components/Viewer/ObjectTree/Base/StickyHeader.vue";
import TreeRow from "@ogw_front/components/Viewer/ObjectTree/Base/TreeRow.vue";
import { useTreeKeyboardNav } from "@ogw_front/composables/tree_keyboard_nav";
import { useTreeScroll } from "@ogw_front/composables/tree_scroll";
import { useVirtualTree } from "@ogw_front/composables/virtual_tree";

const { items, opened, selected, active, scrollTop, options } = defineProps({
  items: { type: Array, required: true },
  opened: { type: Array, required: false, default: () => [] },
  selected: { type: Array, required: false, default: () => [] },
  active: { type: Array, required: false, default: () => [] },
  scrollTop: { type: Number, required: false, default: 0 },
  options: { type: Object, required: false, default: () => ({}) },
});

const treeWrapper = ref(undefined);

const emit = defineEmits([
  "update:opened",
  "update:selected",
  "update:active",
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
    active,
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

const lastActiveIndex = ref(-1);

function handleItemClick(item, index, event) {
  if (index !== undefined) {
    focusedIndex.value = index;
  }

  if (event && (event.ctrlKey || event.metaKey || event.shiftKey)) {
    const newActive = new Set(active);
    const id = item.raw[actualItemProps.value.value];

    if (event.shiftKey && lastActiveIndex.value !== -1 && index !== undefined) {
      const start = Math.min(lastActiveIndex.value, index);
      const end = Math.max(lastActiveIndex.value, index);
      for (let i = start; i <= end; i += 1) {
        const rowItem = displayItems.value[i];
        if (rowItem && rowItem.isLeaf) {
          newActive.add(rowItem.raw[actualItemProps.value.value]);
        }
      }
    } else {
      if (newActive.has(id)) {
        newActive.delete(id);
      } else {
        newActive.add(id);
      }
      if (index !== undefined) {
        lastActiveIndex.value = index;
      }
    }
    emit("update:active", [...newActive]);
    return;
  }

  // Normal click
  if (item.isLeaf) {
    const newActive = [item.raw[actualItemProps.value.value]];
    emit("update:active", newActive);
    if (index !== undefined) {
      lastActiveIndex.value = index;
    }

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
            {
              'leaf-row': item.isLeaf,
              'is-focused': focusedIndex === index,
              'is-active': item.isActive,
            },
          ]"
          class="pa-0"
          tabindex="-1"
          @mousedown.prevent
          @click="
            handleItemClick(item, index, $event);
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
            @hover-eye-enter="emit('hover:leave', { item })"
            @hover-eye-leave="emit('hover:enter', { item })"
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
  min-height: 28px !important;
  cursor: pointer;
  border-radius: 4px;
  margin: 0 2px;
}

.tree-row-wrapper.is-focused {
  background-color: rgba(0, 0, 0, 0.08) !important;
  box-shadow: inset 0 0 0 2px rgba(0, 0, 0, 0.15);
}

.tree-row-wrapper.is-active {
  background-color: rgba(0, 0, 0, 0.08) !important;
}

.tree-row-wrapper:hover:not(.is-focused):not(.is-active) {
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
