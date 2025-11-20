<template>
  <ViewerContextMenuItem
    :itemProps="props.itemProps"
    tooltip="Edges options"
    :btn_image="props.btn_image"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch v-model="visibility" />
      <template v-if="visibility">
        <ViewerOptionsColoringTypeSelector
          :id="id"
          v-model:coloring_style_key="coloring_style_key"
          v-model:color="color"
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>

<script setup>
  import ViewerContextMenuItem from "../../ContextMenuItem.vue"
  import ViewerOptionsVisibilitySwitch from "../../Options/VisibilitySwitch.vue"
  import ViewerOptionsColoringTypeSelector from "../../Options/ColoringTypeSelector.vue"

  const props = defineProps({
    itemProps: { type: Object, required: true },
    btn_image: { type: String, required: true },
  })

  const id = toRef(() => props.itemProps.id)

  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const visibility = computed({
    get: () => dataStyleStore.meshEdgesVisibility(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshEdgesVisibility(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const size = computed({
    get: () => dataStyleStore.edgesSize(id.value),
    set: (newValue) => {
      dataStyleStore.setEdgesSize(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const coloring_style_key = computed({
    get: () => dataStyleStore.meshEdgesActiveColoring(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshEdgesActiveColoring(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const color = computed({
    get: () => dataStyleStore.meshEdgesColor(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshEdgesColor(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
</script>
