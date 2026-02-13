<script setup>
  import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenuItem"
  import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch"
  import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector"

  import { useDataStyleStore } from "@ogw_front/stores/data_style"
  import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"

  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const props = defineProps({
    itemProps: { type: Object, required: true },
    btn_image: { type: String, required: true },
    tooltip: { type: String, required: false, default: "Cells options" },
  })

  const id = toRef(() => props.itemProps.id)

  const visibility = computed({
    get: () => dataStyleStore.meshCellsVisibility(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshCellsVisibility(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const coloring_style_key = computed({
    get: () => dataStyleStore.meshCellsActiveColoring(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshCellsActiveColoring(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const color = computed({
    get: () => dataStyleStore.meshCellsColor(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshCellsColor(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const textures = computed({
    get: () => dataStyleStore.meshCellsTextures(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshCellsTextures(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const vertex_attribute_name = computed({
    get: () => dataStyleStore.meshCellsVertexAttributeName(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshCellsVertexAttributeName(id.value, newValue)
      await dataStyleStore.updateMeshCellsVertexAttribute(id.value)
      hybridViewerStore.remoteRender()
    },
  })
  const vertex_attribute_range = computed({
    get: () => dataStyleStore.meshCellsVertexAttributeRange(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshCellsVertexAttributeRange(
        id.value,
        newValue[0],
        newValue[1],
      )
      await dataStyleStore.updateMeshCellsVertexAttribute(id.value)
      hybridViewerStore.remoteRender()
    },
  })
  const vertex_attribute_color_map = computed({
    get: () => dataStyleStore.meshCellsVertexAttributeColorMap(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshCellsVertexAttributeColorMap(
        id.value,
        newValue,
      )
      hybridViewerStore.remoteRender()
    },
  })
  const cell_attribute_name = computed({
    get: () => dataStyleStore.meshCellsCellAttributeName(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshCellsCellAttributeName(id.value, newValue)
      await dataStyleStore.updateMeshCellsCellAttribute(id.value)
      hybridViewerStore.remoteRender()
    },
  })
  const cell_attribute_range = computed({
    get: () => dataStyleStore.meshCellsCellAttributeRange(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshCellsCellAttributeRange(
        id.value,
        newValue[0],
        newValue[1],
      )
      await dataStyleStore.updateMeshCellsCellAttribute(id.value)
      hybridViewerStore.remoteRender()
    },
  })
  const cell_attribute_color_map = computed({
    get: () => dataStyleStore.meshCellsCellAttributeColorMap(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshCellsCellAttributeColorMap(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
</script>

<template>
  <ViewerContextMenuItem
    :itemProps="props.itemProps"
    :tooltip="props.tooltip"
    :btn_image="props.btn_image"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch v-model="visibility" />
      <template v-if="visibility">
        <ViewerOptionsColoringTypeSelector
          :id="id"
          v-model:coloring_style_key="coloring_style_key"
          v-model:color="color"
          v-model:textures="textures"
          v-model:vertex_attribute_name="vertex_attribute_name"
          v-model:vertex_attribute_range="vertex_attribute_range"
          v-model:vertex_attribute_color_map="vertex_attribute_color_map"
          v-model:cell_attribute_name="cell_attribute_name"
          v-model:cell_attribute_range="cell_attribute_range"
          v-model:cell_attribute_color_map="cell_attribute_color_map"
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
