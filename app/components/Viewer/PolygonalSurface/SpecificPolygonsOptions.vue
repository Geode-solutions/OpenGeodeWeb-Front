<script setup>
  import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenuItem"
  import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch"
  import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector"
  import PolygonalSurfacePolygons from "@ogw_front/assets/viewer_svgs/surface_triangles.svg"

  import { useDataStyleStore } from "@ogw_front/stores/data_style"
  import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"

  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const props = defineProps({
    itemProps: { type: Object, required: true },
    tooltip: { type: String, required: false, default: "Polygons options" },
  })

  const id = toRef(() => props.itemProps.id)

  const visibility = computed({
    get: () => dataStyleStore.meshPolygonsVisibility(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshPolygonsVisibility(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const coloring_style_key = computed({
    get: () => dataStyleStore.meshPolygonsActiveColoring(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshPolygonsActiveColoring(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const color = computed({
    get: () => dataStyleStore.meshPolygonsColor(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshPolygonsColor(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const textures = computed({
    get: () => dataStyleStore.meshPolygonsTextures(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshPolygonsTextures(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const vertex_attribute_name = computed({
    get: () => dataStyleStore.meshPolygonsVertexAttributeName(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshPolygonsVertexAttributeName(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const vertex_attribute_range = computed({
    get: () => dataStyleStore.meshPolygonsVertexAttributeRange(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshPolygonsVertexAttributeRange(
        id.value,
        newValue[0],
        newValue[1],
      )
      const colorMap = dataStyleStore.meshPolygonsVertexAttributeColorMap(
        id.value,
      )
      if (colorMap) {
        dataStyleStore.setMeshPolygonsVertexAttributeColorMap(
          id.value,
          colorMap,
          newValue[0],
          newValue[1],
        )
      }
      hybridViewerStore.remoteRender()
    },
  })
  const vertex_attribute_color_map = computed({
    get: () => dataStyleStore.meshPolygonsVertexAttributeColorMap(id.value),
    set: (newValue) => {
      const range = dataStyleStore.meshPolygonsVertexAttributeRange(id.value)
      dataStyleStore.setMeshPolygonsVertexAttributeColorMap(
        id.value,
        newValue,
        range[0],
        range[1],
      )
      hybridViewerStore.remoteRender()
    },
  })
  const polygon_attribute_name = computed({
    get: () => dataStyleStore.meshPolygonsPolygonAttributeName(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshPolygonsPolygonAttributeName(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const polygon_attribute_range = computed({
    get: () => dataStyleStore.meshPolygonsPolygonAttributeRange(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshPolygonsPolygonAttributeRange(
        id.value,
        newValue[0],
        newValue[1],
      )
      // Re-apply colormap with new range
      const colorMap = dataStyleStore.meshPolygonsPolygonAttributeColorMap(
        id.value,
      )
      if (colorMap) {
        dataStyleStore.setMeshPolygonsPolygonAttributeColorMap(
          id.value,
          colorMap,
          newValue[0],
          newValue[1],
        )
      }
      hybridViewerStore.remoteRender()
    },
  })
  const polygon_attribute_color_map = computed({
    get: () => dataStyleStore.meshPolygonsPolygonAttributeColorMap(id.value),
    set: (newValue) => {
      const range = dataStyleStore.meshPolygonsPolygonAttributeRange(id.value)
      dataStyleStore.setMeshPolygonsPolygonAttributeColorMap(
        id.value,
        newValue,
        range[0],
        range[1],
      )
      hybridViewerStore.remoteRender()
    },
  })
</script>

<template>
  <ViewerContextMenuItem
    :itemProps="props.itemProps"
    :tooltip="props.tooltip"
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
