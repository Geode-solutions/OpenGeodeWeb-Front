<script setup>
const { item, showTooltip } = defineProps({
  item: { type: Object, required: true },
  showTooltip: { type: Boolean, default: false },
});

const emit = defineEmits(["contextmenu"]);

const actualItem = computed(() => item.raw || item);
</script>

<template>
  <span
    class="tree-item-label"
    :class="{ 'inactive-item': actualItem.is_active === false }"
    @contextmenu.prevent.stop="emit('contextmenu', $event)"
  >
    {{ actualItem.title }}
    <v-tooltip
      v-if="showTooltip && actualItem.category"
      activator="parent"
      location="right"
    >
      <div class="d-flex flex-column pa-1">
        <span class="text-caption"
          ><strong>ID:</strong> {{ actualItem.id }}</span
        >
        <span v-if="actualItem.title" class="text-caption"
          ><strong>Name:</strong> {{ actualItem.title }}</span
        >
        <span class="text-caption font-italic border-t-sm d-flex align-center">
          <strong class="mr-1">Status:</strong>
          {{ actualItem.is_active ? "Active" : "Inactive" }}
        </span>
      </div>
    </v-tooltip>
  </span>
</template>

<style scoped>
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
