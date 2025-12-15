<template>
  <v-treeview
    v-model:selected="treeviewStore.selection"
    :items="treeviewStore.items"
    return-object
    class="transparent-treeview"
    item-value="id"
    select-strategy="classic"
    selectable
  >
    <template #title="{ item }">
      <span
        class="treeview-item"
        @click.right.stop="
          isLeafNode(item)
            ? emit('show-menu', { event: $event, itemId: item.id })
            : null
        "
      >
        {{ item.title }}
      </span>
    </template>

    <template #append="{ item }">
      <v-btn
        v-if="isModel(item)"
        icon="mdi-magnify-expand"
        size="medium"
        class="ml-8"
        variant="text"
        v-tooltip="'Model\'s mesh components'"
        @click.stop="treeviewStore.displayAdditionalTree(item.id)"
      />
    </template>
  </v-treeview>
</template>

<script setup>
  import { useTreeviewStore } from "@ogw_front/stores/treeview"
  import { useDataStyleStore } from "@ogw_front/stores/data_style"
  import { useDataBaseStore } from "@ogw_front/stores/data_base"
  import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"

  const treeviewStore = useTreeviewStore()
  const dataStyleStore = useDataStyleStore()
  const dataBaseStore = useDataBaseStore()
  const hybridViewerStore = useHybridViewerStore()

  const emit = defineEmits(["show-menu"])

  function isLeafNode(item) {
    return !item.children || item.children.length === 0
  }

  watch(
    () => treeviewStore.selection,
    (current, previous) => {
      if (!previous) previous = []
      if (current.value === previous) {
        return
      }
      const { added, removed } = compareSelections(current, previous)

      added.forEach((item) => {
        dataStyleStore.setVisibility(item.id, true)
      })

      removed.forEach((item) => {
        dataStyleStore.setVisibility(item.id, false)

        const objectMeta = dataBaseStore.itemMetaDatas(item.id)
        if (objectMeta.viewer_type === "mesh") {
          if (dataBaseStore.db[item.id]?.mesh_components_selection) {
            dataBaseStore.db[item.id].mesh_components_selection = []
          }
          if (dataStyleStore.visibleMeshComponentIds?.[item.id]) {
            dataStyleStore.updateVisibleMeshComponents(item.id, [])
          }
        }
      })
      hybridViewerStore.remoteRender()
    },
  )

  function isModel(item) {
    return item.viewer_type === "model"
  }

  onMounted(() => {
    const savedSelection = treeviewStore.selection
    if (savedSelection && savedSelection.length > 0) {
      treeviewStore.selection = savedSelection
    }
  })
</script>

<style scoped>
  .transparent-treeview {
    background-color: transparent;
    margin: 4px 0;
  }

  .treeview-item {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
    display: inline-block;
  }
</style>
