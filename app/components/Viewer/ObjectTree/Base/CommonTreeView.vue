<script setup>
import { useVirtualTree } from "@ogw_front/composables/use_virtual_tree";

const {
  items,
  itemProps = {},
  opened = [],
  selected = [],
  selection = {},
  search = "",
  customFilter = undefined,
} = defineProps({
  items: { type: Array, required: true },
  itemProps: { type: Object },
  opened: { type: Array },
  selected: { type: Array },
  selection: { type: Object },
  search: { type: String },
  customFilter: { type: Function },
});

const emit = defineEmits(["update:opened", "update:selected", "click:item"]);

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
</script>

<template>
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
.common-tree-view {
  height: 100%;
}

.tree-row {
  min-height: 44px !important;
  cursor: pointer;
}

.tree-row-content {
  min-height: 24px;
}

:deep(.v-list-item__content) {
  padding: 0 !important;
  display: block !important;
}

.icon-placeholder {
  width: 24px;
}

.indent-space {
  flex-shrink: 0;
}

:deep(.v-list-item__overlay) {
  display: none !important;
}

.v-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

:deep(.v-checkbox-btn .v-selection-control__input .v-icon) {
  color: #000 !important;
}

.tree-checkbox {
  width: 32px !important;
}
</style>
