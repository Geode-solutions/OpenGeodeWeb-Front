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
  const treeviewStore = useTreeviewStore()
  const dataStyleStore = useDataStyleStore()
  const dataBaseStore = useDataBaseStore()
  const hybridViewerStore = useHybridViewerStore()
  const emit = defineEmits(["show-menu"])

  function isLeafNode(item) {
    return !item.children || item.children.length === 0
  }

  function isModel(item) {
    return item.object_type === "model"
  }

  watch(
    () => treeviewStore.selection,
    (current, previous) => {
      const added = current.filter(
        (item) => !previous.find((p) => p.id === item.id),
      )
      const removed = previous.filter(
        (item) => !current.find((c) => c.id === item.id),
      )

      added.forEach((item) => {
        dataStyleStore.setVisibility(item.id, true)
      })
      removed.forEach((item) => {
        dataStyleStore.setVisibility(item.id, false)
      })

      if (added.length > 0 || removed.length > 0) {
        hybridViewerStore.remoteRender()
      }
    },
    { deep: true },
  )

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
