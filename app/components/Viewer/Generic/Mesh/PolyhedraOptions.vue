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
    tooltip: { type: String, required: false, default: "Polyhedra options" },
  })

  const id = toRef(() => itemProps.id)

  const visibility = computed({
    get: () => dataStyleStore.meshPolyhedraVisibility(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshPolyhedraVisibility(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const coloring_style_key = computed({
    get: () => dataStyleStore.meshPolyhedraActiveColoring(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshPolyhedraActiveColoring(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const color = computed({
    get: () => dataStyleStore.meshPolyhedraColor(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshPolyhedraColor(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const vertex_attribute_name = computed({
    get: () => dataStyleStore.meshPolyhedraVertexAttributeName(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshPolyhedraVertexAttributeName(
        id.value,
        newValue,
      )
      await dataStyleStore.updateMeshPolyhedraVertexAttribute(id.value)
      hybridViewerStore.remoteRender()
    },
  })
  const vertex_attribute_range = computed({
    get: () => dataStyleStore.meshPolyhedraVertexAttributeRange(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshPolyhedraVertexAttributeRange(
        id.value,
        newValue[0],
        newValue[1],
      )
      await dataStyleStore.updateMeshPolyhedraVertexAttribute(id.value)
      hybridViewerStore.remoteRender()
    },
  })
  const vertex_attribute_color_map = computed({
    get: () => dataStyleStore.meshPolyhedraVertexAttributeColorMap(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshPolyhedraVertexAttributeColorMap(
        id.value,
        newValue,
      )
      await dataStyleStore.updateMeshPolyhedraVertexAttribute(id.value)
      hybridViewerStore.remoteRender()
    },
  })
  const polyhedron_attribute_name = computed({
    get: () => dataStyleStore.meshPolyhedraPolyhedronAttributeName(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshPolyhedraPolyhedronAttributeName(
        id.value,
        newValue,
      )
      await dataStyleStore.updateMeshPolyhedraPolyhedronAttribute(id.value)
      hybridViewerStore.remoteRender()
    },
  })
  const polyhedron_attribute_range = computed({
    get: () => dataStyleStore.meshPolyhedraPolyhedronAttributeRange(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshPolyhedraPolyhedronAttributeRange(
        id.value,
        newValue[0],
        newValue[1],
      )
      await dataStyleStore.updateMeshPolyhedraPolyhedronAttribute(id.value)
      hybridViewerStore.remoteRender()
    },
  })
  const polyhedron_attribute_color_map = computed({
    get: () =>
      dataStyleStore.meshPolyhedraPolyhedronAttributeColorMap(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshPolyhedraPolyhedronAttributeColorMap(
        id.value,
        newValue,
      )
      await dataStyleStore.updateMeshPolyhedraPolyhedronAttribute(id.value)
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
          v-model:vertex_attribute_name="vertex_attribute_name"
          v-model:vertex_attribute_range="vertex_attribute_range"
          v-model:vertex_attribute_color_map="vertex_attribute_color_map"
          v-model:polyhedron_attribute_name="polyhedron_attribute_name"
          v-model:polyhedron_attribute_range="polyhedron_attribute_range"
          v-model:polyhedron_attribute_color_map="
            polyhedron_attribute_color_map
          "
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
