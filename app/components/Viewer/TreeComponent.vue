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
  const componentTypeMap = {}
  let isUpdating = false

  async function updateTree() {
    isUpdating = true
    const fetchedItems = await dataStore.formatedMeshComponents(props.id)
    items.value = fetchedItems

    for (const key in componentTypeMap) delete componentTypeMap[key]
    fetchedItems.forEach((group) => {
      group.children.forEach((child) => {
        componentTypeMap[child.id] = group.id
      })
    })

    mesh_components_selection.value = dataStyleStore.visibleMeshComponents(
      props.id,
    ).value
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
    (current, previous) => {
      if (isUpdating) return
      if (!previous) previous = []
      else {
        const { added, removed } = compareSelections(current, previous)

        const [added_corners, added_lines, added_surfaces, added_blocks] =
          sortMeshComponents(added)
        const [
          removed_corners,
          removed_lines,
          removed_surfaces,
          removed_blocks,
        ] = sortMeshComponents(removed)
        if (added_corners.length > 0) {
          dataStyleStore.setModelCornersVisibility(
            props.id,
            added_corners,
            true,
          )
        }
        if (added_lines.length > 0) {
          dataStyleStore.setModelLinesVisibility(props.id, added_lines, true)
        }
        if (added_surfaces.length > 0) {
          dataStyleStore.setModelSurfacesVisibility(
            props.id,
            added_surfaces,
            true,
          )
        }
        if (added_blocks.length > 0) {
          dataStyleStore.setModelBlocksVisibility(props.id, added_blocks, true)
        }
        if (removed_corners.length > 0) {
          dataStyleStore.setModelCornersVisibility(
            props.id,
            removed_corners,
            false,
          )
        }
        if (removed_lines.length > 0) {
          dataStyleStore.setModelLinesVisibility(props.id, removed_lines, false)
        }
        if (removed_surfaces.length > 0) {
          dataStyleStore.setModelSurfacesVisibility(
            props.id,
            removed_surfaces,
            false,
          )
        }
        if (removed_blocks.length > 0) {
          dataStyleStore.setModelBlocksVisibility(
            props.id,
            removed_blocks,
            false,
          )
        }
        hybridViewerStore.remoteRender()
      }
    },
    { immediate: false, deep: true },
  )

  function sortMeshComponents(ids) {
    var corner_ids = [],
      line_ids = [],
      surface_ids = [],
      block_ids = []
    for (const id of ids) {
      const item_type = componentTypeMap[id]
      if (item_type === "Corner") corner_ids.push(id)
      else if (item_type === "Line") line_ids.push(id)
      else if (item_type === "Surface") surface_ids.push(id)
      else if (item_type === "Block") block_ids.push(id)
    }
    return [corner_ids, line_ids, surface_ids, block_ids]
  }

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
