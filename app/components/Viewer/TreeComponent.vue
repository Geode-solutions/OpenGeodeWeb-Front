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
    const fetchedItems = await dataStore.formatedMeshComponents(props.id)
    items.value = fetchedItems

    const visibleIds = dataStyleStore.visibleMeshComponents(props.id).value
    const selection = []
    fetchedItems.forEach((group) => {
      group.children.forEach((child) => {
        if (visibleIds.includes(child.id)) {
          selection.push(child)
        }
      })
    })
    mesh_components_selection.value = selection

    setTimeout(() => {
      isUpdating = false
    }, 0)
  }

  watch(
    () => props.id,
    async () => {
      await updateTree()
    },
  )

  watch(
    mesh_components_selection,
    async (current, previous) => {
      if (isUpdating) return
      if (!previous) return
      const { added, removed } = compareSelections(current, previous)

      const updateVisibility = async (items, visibility) => {
        const grouped = items.reduce((acc, item) => {
          if (!acc[item.category]) acc[item.category] = []
          acc[item.category].push(item.id)
          return acc
        }, {})

        const promises = Object.entries(grouped).map(([category, ids]) => {
          if (category === "Corner") {
            return dataStyleStore.setModelCornersVisibility(
              props.id,
              ids,
              visibility,
            )
          } else if (category === "Line") {
            return dataStyleStore.setModelLinesVisibility(
              props.id,
              ids,
              visibility,
            )
          } else if (category === "Surface") {
            return dataStyleStore.setModelSurfacesVisibility(
              props.id,
              ids,
              visibility,
            )
          } else if (category === "Block") {
            return dataStyleStore.setModelBlocksVisibility(
              props.id,
              ids,
              visibility,
            )
          }
        })
        return Promise.all(promises)
      }

      await Promise.all([
        updateVisibility(added, true),
        updateVisibility(removed, false),
      ])
      hybridViewerStore.remoteRender()
    },
    { immediate: true, deep: true },
  )

  onMounted(async () => {
    await updateTree()
  })
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
