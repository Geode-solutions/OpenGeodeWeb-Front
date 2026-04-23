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
  { scrollTop },
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
  <v-virtual-scroll
    :items="displayItems"
    :item-height="actualItemProps.height"
    class="common-tree-view"
  >
    <template #default="{ item }">
      <v-list-item
        :class="['tree-row', { 'leaf-row': item.isLeaf }]"
        class="pa-0"
        @click="
          item.isLeaf ? emit('click:item', item.raw) : toggleOpen(item.raw)
        "
      >
        <div class="tree-row-content d-flex align-center px-4 ps-3 w-100">
          <div
            v-if="item.depth > 0"
            class="flex-shrink-0"
            style="width: 24px"
          />
          <div class="d-flex align-center flex-shrink-0">
            <v-icon
              v-if="!item.isLeaf"
              :icon="item.isOpen ? 'mdi-menu-down' : 'mdi-menu-right'"
              class="me-1"
              color="black"
              @click.stop="toggleOpen(item.raw)"
            />
            <div v-else class="icon-placeholder" />

            <v-checkbox-btn
              v-if="actualSelection.selectable"
              :model-value="isSelected(item.raw)"
              :indeterminate="getIndeterminate(item.raw)"
              density="compact"
              hide-details
              color="black"
              @click.stop="toggleSelect(item.raw)"
              @mousedown.stop
            />
          </div>

          <div
            class="tree-title flex-grow-1 overflow-hidden d-flex align-center ms-1 pt-1"
          >
            <slot name="title" :item="item.raw" :is-leaf="item.isLeaf">
              <v-list-item-title class="text-black">
                {{ item.raw[actualItemProps.title] || item.id }}
              </v-list-item-title>
            </slot>
          </div>

          <div class="ms-auto d-flex align-center">
            <slot name="append" :item="item.raw" />
          </div>
        </div>
      </v-list-item>
    </template>
  </v-virtual-scroll>
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
