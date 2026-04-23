<script setup>
const { item, isLeaf = undefined } = defineProps({
  item: { type: Object, required: true },
  isLeaf: { type: Boolean },
});

const emit = defineEmits(["contextmenu", "mouseenter", "mouseleave"]);

const actualItem = computed(() => item.raw || item);

const tooltipDisabled = computed(() => {
  if (isLeaf !== undefined) {
    return !isLeaf;
  }
  return actualItem.value.children && actualItem.value.children.length > 0;
});
</script>

<template>
  <div class="tree-item-label-container w-100">
    <v-tooltip :disabled="tooltipDisabled" location="right" open-delay="400">
      <template #activator="{ props: tooltipProps }">
        <span
          v-bind="tooltipProps"
          class="tree-item-label"
          :class="{ 'inactive-item': actualItem.is_active === false }"
          title=""
          @contextmenu.prevent.stop="emit('contextmenu', $event)"
          @mouseenter="emit('mouseenter')"
          @mouseleave="emit('mouseleave')"
        >
          {{ actualItem.title }}
        </span>
      </template>

      <div class="d-flex flex-column ga-1">
        <span class="text-caption">
          <strong class="text-white">ID:</strong> {{ actualItem.id }}
        </span>
        <span v-if="actualItem.title" class="text-caption">
          <strong class="text-white">Name:</strong> {{ actualItem.title }}
        </span>
        <span class="text-caption">
          <strong class="text-white">Status:</strong>
          <i class="ml-1">{{ actualItem.is_active ? "Active" : "Inactive" }}</i>
        </span>
      </div>
    </v-tooltip>
  </div>
</template>

<style scoped>
.tree-item-label-container {
  display: flex;
  align-items: center;
  min-width: 0;
  height: 100%;
  width: 100%;
}

.tree-item-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.inactive-item {
  opacity: 0.4;
  font-style: italic;
}
</style>
