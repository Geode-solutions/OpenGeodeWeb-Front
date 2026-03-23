<script setup>
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

import { compareSelections } from "@ogw_front/utils/treeview";

const dataStyleStore = useDataStyleStore();
const dataStore = useDataStore();
const hybridViewerStore = useHybridViewerStore();

const { id } = defineProps({ id: { type: String, required: true } });

const emit = defineEmits(["show-menu"]);

const items = ref([]);
const mesh_components_selection = dataStyleStore.visibleMeshComponents(id);

watchEffect(async () => {
  items.value = await dataStore.formatedMeshComponents(id);
});

watch(
  mesh_components_selection,
  async (current, previous) => {
    if (!previous) {
      return;
    }

    const { added, removed } = compareSelections(current, previous);

    if (added.length > 0) {
      await dataStyleStore.setModelMeshComponentsVisibility(id, added, true);
    }
    if (removed.length > 0) {
      await dataStyleStore.setModelMeshComponentsVisibility(id, removed, false);
    }
    hybridViewerStore.remoteRender();
  },
  { deep: true },
);
</script>

<template>
  <v-treeview
    v-model:selected="mesh_components_selection"
    :items="items"
    class="transparent-treeview"
    item-value="id"
    select-strategy="classic"
    selectable
  >
    <template #title="{ item }">
      <span
        class="treeview-item"
        :class="{ 'inactive-item': item.is_active === false }"
        @contextmenu.prevent.stop="emit('show-menu', { event: $event, itemId: item })"
      >
        {{ item.title }}
        <v-tooltip v-if="item.category" activator="parent" location="right">
          <div class="d-flex flex-column pa-1">
            <span class="text-caption"><strong>ID:</strong> {{ item.id }}</span>
            <span v-if="item.title" class="text-caption"
              ><strong>Name:</strong> {{ item.title }}</span
            >
            <span class="text-caption font-italic border-t-sm d-flex align-center">
              <strong class="mr-1">Status:</strong> {{ item.is_active ? "Active" : "Inactive" }}
            </span>
          </div>
        </v-tooltip>
      </span>
    </template>
  </v-treeview>
</template>

<style scoped>
.treeview-item {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: inline-block;
}
.inactive-item {
  opacity: 0.4;
  font-style: italic;
}

.transparent-treeview {
  background-color: transparent;
  margin: 4px 0;
}
</style>
