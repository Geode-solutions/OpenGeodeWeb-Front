<script setup>
const { item, itemProps, selection, isSelected, getIndeterminate } = defineProps({
  item: { type: Object, required: true },
  itemProps: { type: Object, required: true },
  selection: { type: Object, required: true },
  isSelected: { type: Function, required: true },
  getIndeterminate: { type: Function, required: true },
});

defineEmits(["toggle-open", "toggle-select"]);

const INDENT_STEP = 16;
</script>

<template>
  <div class="tree-row-content d-flex align-center px-4 ps-3 w-100">
    <div
      v-if="item.depth > 0"
      class="flex-shrink-0"
      :style="{ width: `${item.depth * INDENT_STEP}px` }"
    />

    <div class="d-flex align-center flex-shrink-0">
      <v-icon
        v-if="!item.isLeaf"
        :icon="item.isOpen ? 'mdi-menu-down' : 'mdi-menu-right'"
        class="me-1"
        color="black"
        @click.stop="$emit('toggle-open', item.raw)"
      />
      <div v-else class="icon-placeholder" />

      <v-checkbox-btn
        v-if="selection.selectable"
        :model-value="isSelected(item.raw)"
        :indeterminate="getIndeterminate(item.raw)"
        density="compact"
        hide-details
        color="black"
        @click.stop="$emit('toggle-select', item.raw)"
        @mousedown.stop
      />
    </div>

    <div class="tree-title flex-grow-1 overflow-hidden d-flex align-center ms-1 pt-1">
      <slot name="title" :item="item.raw" :is-leaf="item.isLeaf">
        <v-list-item-title :class="{ 'font-weight-bold': !item.isLeaf }" class="text-black">
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
  min-height: 44px;
}

.icon-placeholder {
  width: 24px;
}

.tree-title {
  min-height: 24px;
}

:deep(.v-checkbox-btn .v-selection-control__input .v-icon) {
  color: #000 !important;
}
</style>
