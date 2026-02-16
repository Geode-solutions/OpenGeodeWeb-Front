<script setup>
  import PolygonalSurfacePolygons from "@ogw_front/assets/viewer_svgs/surface_triangles.svg"
  import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenuItem"
  import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector"
  import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch"

  import { useDataStyleStore } from "@ogw_front/stores/data_style"
  import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"

  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const { itemProps } = defineProps({
    itemProps: { type: Object, required: true },
    tooltip: { type: String, required: false, default: "Polygons options" },
  })

  const id = toRef(() => itemProps.id)

  const visibility = computed({
    get: () => dataStyleStore.meshPolygonsVisibility(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshPolygonsVisibility(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const coloring_style_key = computed({
    get: () => dataStyleStore.meshPolygonsActiveColoring(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshPolygonsActiveColoring(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const color = computed({
    get: () => dataStyleStore.meshPolygonsColor(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshPolygonsColor(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const textures = computed({
    get: () => dataStyleStore.meshPolygonsTextures(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshPolygonsTextures(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const vertex_attribute_name = computed({
    get: () => dataStyleStore.meshPolygonsVertexAttributeName(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshPolygonsVertexAttributeName(
        id.value,
        newValue,
      )
      await dataStyleStore.updateMeshPolygonsVertexAttribute(id.value)
      hybridViewerStore.remoteRender()
    },
  })
  const vertex_attribute_range = computed({
    get: () => dataStyleStore.meshPolygonsVertexAttributeRange(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshPolygonsVertexAttributeRange(
        id.value,
        newValue[0],
        newValue[1],
      )
      await dataStyleStore.updateMeshPolygonsVertexAttribute(id.value)
      hybridViewerStore.remoteRender()
    },
  })
  const vertex_attribute_color_map = computed({
    get: () => dataStyleStore.meshPolygonsVertexAttributeColorMap(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshPolygonsVertexAttributeColorMap(
        id.value,
        newValue,
      )
      hybridViewerStore.remoteRender()
    },
  })
  const polygon_attribute_name = computed({
    get: () => dataStyleStore.meshPolygonsPolygonAttributeName(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshPolygonsPolygonAttributeName(
        id.value,
        newValue,
      )
      await dataStyleStore.updateMeshPolygonsPolygonAttribute(id.value)
      hybridViewerStore.remoteRender()
    },
  })
  const polygon_attribute_range = computed({
    get: () => dataStyleStore.meshPolygonsPolygonAttributeRange(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshPolygonsPolygonAttributeRange(
        id.value,
        newValue[0],
        newValue[1],
      )
      await dataStyleStore.updateMeshPolygonsPolygonAttribute(id.value)
      hybridViewerStore.remoteRender()
    },
  })
  const polygon_attribute_color_map = computed({
    get: () => dataStyleStore.meshPolygonsPolygonAttributeColorMap(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshPolygonsPolygonAttributeColorMap(
        id.value,
        newValue,
      )
      hybridViewerStore.remoteRender()
    },
  })
</script>

<template>
  <ViewerContextMenuItem
    :itemProps="itemProps"
    :tooltip="tooltip"
    :btn_image="PolygonalSurfacePolygons"
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
          v-model:polygon_attribute_name="polygon_attribute_name"
          v-model:polygon_attribute_range="polygon_attribute_range"
          v-model:polygon_attribute_color_map="polygon_attribute_color_map"
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
