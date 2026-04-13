<script setup>
const props = defineProps({
  item: { type: Object, required: true },
  showTooltip: { type: Boolean, default: false },
});

const emit = defineEmits(["contextmenu"]);
</script>

<template>
  <span
    class="tree-item-label"
    :class="{ 'inactive-item': item.is_active === false }"
    @contextmenu.prevent.stop="emit('contextmenu', $event)"
  >
    {{ item.title }}

    <v-tooltip v-if="showTooltip && item.category" activator="parent" location="right">
      <div class="d-flex flex-column pa-1">
        <span class="text-caption"><strong>ID:</strong> {{ item.id }}</span>
        <span v-if="item.title" class="text-caption"><strong>Name:</strong> {{ item.title }}</span>
        <span class="text-caption font-italic border-t-sm d-flex align-center">
          <strong class="mr-1">Status:</strong> {{ item.is_active ? "Active" : "Inactive" }}
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
  display: inline-block;
  cursor: pointer;
}

.inactive-item {
  opacity: 0.4;
  font-style: italic;
}
</style>
