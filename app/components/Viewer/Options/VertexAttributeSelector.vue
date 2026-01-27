<template>
  <div>
    <v-select
      v-model="vertex_attribute_name"
      :items="vertex_attribute_names"
      label="Select an attribute"
      density="compact"
    />
    <ViewerOptionsAttributeColorBar
      v-if="vertex_attribute_name"
      v-model:min="vertex_attribute.min"
      v-model:max="vertex_attribute.max"
      @update:min="onScalarRangeChange"
      @update:max="onScalarRangeChange"
    />
  </div>
</template>

<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"
  import { useDataStyleStore } from "@ogw_front/stores/data_style"
  import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"
  import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar"

  const geodeStore = useGeodeStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const model = defineModel()

  const props = defineProps({
    id: { type: String, required: true },
    meshType: { type: String, default: "polygons" },
  })

  const vertex_attribute_name = ref("")
  const vertex_attribute_names = ref([])

  const vertex_attribute = reactive({
    name: vertex_attribute_name.value,
    min: undefined,
    max: undefined,
  })

  onMounted(() => {
    if (model.value != null) {
      vertex_attribute_name.value = model.value.name
      vertex_attribute.min = model.value.min
      vertex_attribute.max = model.value.max
    }
  })

  watch(vertex_attribute_name, (value) => {
    vertex_attribute.name = value
    model.value = vertex_attribute
  })

  watch(
    () => [vertex_attribute.min, vertex_attribute.max],
    () => {
      model.value = { ...vertex_attribute }
    },
  )

  function onScalarRangeChange() {
    if (
      vertex_attribute.min !== undefined &&
      vertex_attribute.max !== undefined
    ) {
      if (props.meshType === "polygons") {
        dataStyleStore.setMeshPolygonsVertexScalarRange(
          props.id,
          vertex_attribute.min,
          vertex_attribute.max,
        )
      } else if (props.meshType === "cells") {
        dataStyleStore.setMeshCellsVertexScalarRange(
          props.id,
          vertex_attribute.min,
          vertex_attribute.max,
        )
      } else if (props.meshType === "edges") {
        dataStyleStore.setMeshEdgesVertexScalarRange(
          props.id,
          vertex_attribute.min,
          vertex_attribute.max,
        )
      } else if (props.meshType === "points") {
        dataStyleStore.setMeshPointsVertexScalarRange(
          props.id,
          vertex_attribute.min,
          vertex_attribute.max,
        )
      } else if (props.meshType === "polyhedra") {
        dataStyleStore.setPolyhedraVertexScalarRange(
          props.id,
          vertex_attribute.min,
          vertex_attribute.max,
        )
      }
      hybridViewerStore.remoteRender()
    }
  }

  onMounted(() => {
    getVertexAttributes()
  })

  function getVertexAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.vertex_attribute_names,
      { id: props.id },
      {
        response_function: (response) => {
          vertex_attribute_names.value = response.vertex_attribute_names
        },
      },
    )
  }
</script>
