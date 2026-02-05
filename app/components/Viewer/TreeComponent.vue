<script setup>
  import { useDataStyleStore } from "@ogw_front/stores/data_style"
  import { useDataStore } from "@ogw_front/stores/data"
  import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"

  import { compareSelections } from "@ogw_front/utils/treeview"

  const dataStyleStore = useDataStyleStore()
  const dataStore = useDataStore()
  const hybridViewerStore = useHybridViewerStore()

  const props = defineProps({ id: { type: String, required: true } })

  const emit = defineEmits(["show-menu"])

  const items = ref([])
  const mesh_components_selection = ref([])
  let isUpdating = false

  async function updateTree() {
    isUpdating = true
    items.value = await dataStore.formatedMeshComponents(props.id)
    const visibleIds = dataStyleStore.visibleMeshComponents(props.id).value
    mesh_components_selection.value = items.value
      .flatMap((group) => group.children)
      .filter((child) => visibleIds.includes(child.id))
    setTimeout(() => {
      isUpdating = false
    }, 0)
  }

  watch(
    () => props.id,
    async () => {
      await updateTree()
    },
    { immediate: true },
  )

  watch(
    mesh_components_selection,
    async (current, previous) => {
      if (isUpdating) return
      if (!previous) previous = []
      const { added, removed } = compareSelections(current, previous)

      const promises = []
      for (const item of added) {
        promises.push(
          dataStyleStore.setModelMeshComponentVisibility(
            props.id,
            [item.id],
            true,
          ),
        )
      }

      for (const item of removed) {
        promises.push(
          dataStyleStore.setModelMeshComponentVisibility(
            props.id,
            [item.id],
            false,
          ),
        )
      }
      await Promise.all(promises)
      hybridViewerStore.remoteRender()
    },
    { immediate: true, deep: true },
  )
</script>

<template>
  <v-treeview
    v-model:selected="mesh_components_selection"
    :items="items"
    class="transparent-treeview"
    item-value="id"
    select-strategy="classic"
    selectable
    return-object
  >
    <template #title="{ item }">
      <span
        class="treeview-item"
        @contextmenu.prevent.stop="
          emit('show-menu', { event: $event, itemId: item })
        "
        >{{ item.title }}</span
      >
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

  .transparent-treeview {
    background-color: transparent;
    margin: 4px 0;
  }
</style>
