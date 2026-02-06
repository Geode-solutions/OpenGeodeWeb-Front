<script setup>
  import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenuItem"
  import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector"
  import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch"

  import { useDataStyleStore } from "@ogw_front/stores/data_style"
  import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"

  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const { itemProps, btn_image, tooltip } = defineProps({
    itemProps: { type: Object, required: true },
    btn_image: { type: String, required: true },
    tooltip: { type: String, required: false, default: "Cells options" },
  })

  const id = toRef(() => itemProps.id)

  const visibility = computed({
    get: () => dataStyleStore.meshCellsVisibility(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshCellsVisibility(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const coloring_style_key = computed({
    get: () => dataStyleStore.meshCellsActiveColoring(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshCellsActiveColoring(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const color = computed({
    get: () => dataStyleStore.meshCellsColor(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshCellsColor(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const textures = computed({
    get: () => dataStyleStore.meshCellsTextures(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshCellsTextures(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const vertex_attribute = computed({
    get: () => dataStyleStore.meshCellsVertexAttribute(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshCellsVertexAttribute(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const cell_attribute = computed({
    get: () => dataStyleStore.meshCellsCellAttribute(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshCellsCellAttribute(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
</script>

<template>
  <ViewerContextMenuItem
    :itemProps="itemProps"
    :tooltip="tooltip"
    :btn_image="btn_image"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch v-model="visibility" />
      <template v-if="visibility">
        <ViewerOptionsColoringTypeSelector
          :id="id"
          v-model:coloring_style_key="coloring_style_key"
          v-model:color="color"
          v-model:textures="textures"
          v-model:vertex_attribute="vertex_attribute"
          v-model:cell_attribute="cell_attribute"
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
