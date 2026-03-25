<script setup>
import { useDataStore } from "@ogw_front/stores/data";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

const dataStore = useDataStore();
const treeviewStore = useTreeviewStore();

const selectedTree = computed(() => treeviewStore.selectedTree);

function goBackToFileTree() {
  treeviewStore.displayFileTree();
}

const model_id = computed(() => treeviewStore.model_id);

const metaDatas = computed(() => {
  if (!model_id.value) {
    return {};
  }
  return dataStore.refItem(model_id.value).value || {};
});
</script>

<template>
  <v-breadcrumbs class="mb-n10 breadcrumb-container">
    <div class="d-flex align-center gap-2 ml-2 mt-2 mb-1">
      <template v-if="treeviewStore.isAdditionnalTreeDisplayed">
        <v-btn icon variant="text" size="medium" @click.stop="goBackToFileTree">
          <v-icon size="large">mdi-file-tree</v-icon>
        </v-btn>
        <span class="text-h5 font-weight-bold">/</span>
        <v-icon size="large">
          {{
            selectedTree && selectedTree.icon
              ? selectedTree.icon
              : "mdi-shape-outline"
          }}
        </v-icon>
        <span class="text-subtitle-1 font-weight-regular align-center mt-1">
          Model Explorer ({{ metaDatas.name }})
        </span>
      </template>

      <div v-else class="d-flex align-center gap-2">
        <v-icon size="large">mdi-file-tree</v-icon>
        <span class="text-subtitle-1 font-weight-regular align-center mt-1">
          Objects
        </span>
      </div>
    </div>
  </v-breadcrumbs>
</template>

<style scoped>
.breadcrumb-container {
  position: relative;
  z-index: 10;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
}
</style>
