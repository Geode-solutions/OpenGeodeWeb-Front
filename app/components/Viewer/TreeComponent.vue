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
  const mesh_components_selection = dataStyleStore.visibleMeshComponents(
    props.id,
  )

  watchEffect(async () => {
    items.value = await dataStore.formatedMeshComponents(props.id)
  })

  watch(
    mesh_components_selection,
    async (current, previous) => {
      if (!previous) return

      const { added, removed } = compareSelections(current, previous)

    if (added.length > 0) {
      await dataStyleStore.setModelMeshComponentsVisibility(
        props.id,
        added,
        true,
      )
    }
    if (removed.length > 0) {
      await dataStyleStore.setModelMeshComponentsVisibility(
        props.id,
        removed,
        false,
      )
    }
    hybridViewerStore.remoteRender()
  },
  { deep: true },
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
