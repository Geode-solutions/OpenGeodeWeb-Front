<script setup>
  import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenuItem"
  import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch"
  import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector"
  import SolidPolyhedra from "@ogw_front/assets/viewer_svgs/solid_polyhedra.svg"

  import { useDataStyleStore } from "@ogw_front/stores/data_style"
  import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"

  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const props = defineProps({
    itemProps: { type: Object, required: true },
    tooltip: { type: String, required: false, default: "Polyhedra options" },
  })

  const id = toRef(() => props.itemProps.id)

  const visibility = computed({
    get: () => dataStyleStore.meshPolyhedraVisibility(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshPolyhedraVisibility(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const coloring_style_key = computed({
    get: () => dataStyleStore.meshPolyhedraActiveColoring(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshPolyhedraActiveColoring(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const color = computed({
    get: () => dataStyleStore.meshPolyhedraColor(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshPolyhedraColor(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const vertex_attribute_name = computed({
    get: () => dataStyleStore.meshPolyhedraVertexAttributeName(id.value),
    set: () => {},
  })
  const vertex_attribute_range = computed({
    get: () => dataStyleStore.meshPolyhedraVertexAttributeRange(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshPolyhedraVertexAttributeRange(
        id.value,
        newValue[0],
        newValue[1],
      )
      const colorMap = dataStyleStore.meshPolyhedraVertexAttributeColorMap(
        id.value,
      )
      if (colorMap) {
        dataStyleStore.setMeshPolyhedraVertexAttributeColorMap(
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
    get: () => dataStyleStore.meshPolyhedraVertexAttributeColorMap(id.value),
    set: (newValue) => {
      const range = dataStyleStore.meshPolyhedraVertexAttributeRange(id.value)
      dataStyleStore.setMeshPolyhedraVertexAttributeColorMap(
        id.value,
        newValue,
        range[0],
        range[1],
      )
      hybridViewerStore.remoteRender()
    },
  })
  const polyhedron_attribute_name = computed({
    get: () => dataStyleStore.meshPolyhedraPolyhedronAttributeName(id.value),
    set: () => {},
  })
  const polyhedron_attribute_range = computed({
    get: () => dataStyleStore.meshPolyhedraPolyhedronAttributeRange(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshPolyhedraPolyhedronAttributeRange(
        id.value,
        newValue[0],
        newValue[1],
      )
      const colorMap = dataStyleStore.meshPolyhedraPolyhedronAttributeColorMap(
        id.value,
      )
      if (colorMap) {
        dataStyleStore.setMeshPolyhedraPolyhedronAttributeColorMap(
          id.value,
          colorMap,
          newValue[0],
          newValue[1],
        )
      }
      hybridViewerStore.remoteRender()
    },
  })
  const polyhedron_attribute_color_map = computed({
    get: () =>
      dataStyleStore.meshPolyhedraPolyhedronAttributeColorMap(id.value),
    set: (newValue) => {
      const range = dataStyleStore.meshPolyhedraPolyhedronAttributeRange(
        id.value,
      )
      dataStyleStore.setMeshPolyhedraPolyhedronAttributeColorMap(
        id.value,
        newValue,
        range[0],
        range[1],
      )
      hybridViewerStore.remoteRender()
    },
  })

  function onVertexAttributeSelected(data) {
    dataStyleStore.setMeshPolyhedraVertexAttributeName(
      id.value,
      data.name,
      data.defaultMin,
      data.defaultMax,
    )
    hybridViewerStore.remoteRender()
  }
  function onPolyhedronAttributeSelected(data) {
    dataStyleStore.setMeshPolyhedraPolyhedronAttributeName(
      id.value,
      data.name,
      data.defaultMin,
      data.defaultMax,
    )
    hybridViewerStore.remoteRender()
  }
</script>
<template>
  <ViewerContextMenuItem
    :itemProps="props.itemProps"
    :tooltip="props.tooltip"
    :btn_image="SolidPolyhedra"
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
          @vertex-attribute-selected="onVertexAttributeSelected"
          @polyhedron-attribute-selected="onPolyhedronAttributeSelected"
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
