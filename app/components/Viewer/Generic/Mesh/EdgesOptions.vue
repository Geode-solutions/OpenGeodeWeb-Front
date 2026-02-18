<script setup>
  import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenuItem"
  import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector"
  import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch"

  import { useDataStyleStore } from "@ogw_front/stores/data_style"
  import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"

  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const { itemProps, btn_image } = defineProps({
    itemProps: { type: Object, required: true },
    btn_image: { type: String, required: true },
  })

  const id = toRef(() => itemProps.id)

  const visibility = computed({
    get: () => dataStyleStore.meshEdgesVisibility(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshEdgesVisibility(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const size = computed({
    get: () => dataStyleStore.meshEdgesWidth(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshEdgesWidth(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const coloring_style_key = computed({
    get: () => dataStyleStore.meshEdgesActiveColoring(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshEdgesActiveColoring(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const color = computed({
    get: () => dataStyleStore.meshEdgesColor(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshEdgesColor(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const vertex_attribute_name = computed({
    get: () => dataStyleStore.meshEdgesVertexAttributeName(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshEdgesVertexAttributeName(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const vertex_attribute_range = computed({
    get: () => dataStyleStore.meshEdgesVertexAttributeRange(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshEdgesVertexAttributeRange(
        id.value,
        newValue[0],
        newValue[1],
      )
      hybridViewerStore.remoteRender()
    },
  })
  const vertex_attribute_color_map = computed({
    get: () => dataStyleStore.meshEdgesVertexAttributeColorMap(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshEdgesVertexAttributeColorMap(
        id.value,
        newValue,
      )
      hybridViewerStore.remoteRender()
    },
  })
  const edge_attribute_name = computed({
    get: () => dataStyleStore.meshEdgesEdgeAttributeName(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshEdgesEdgeAttributeName(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const edge_attribute_range = computed({
    get: () => dataStyleStore.meshEdgesEdgeAttributeRange(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshEdgesEdgeAttributeRange(
        id.value,
        newValue[0],
        newValue[1],
      )
      hybridViewerStore.remoteRender()
    },
  })
  const edge_attribute_color_map = computed({
    get: () => dataStyleStore.meshEdgesEdgeAttributeColorMap(id.value),
    set: async (newValue) => {
      await dataStyleStore.setMeshEdgesEdgeAttributeColorMap(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
</script>

<template>
  <ViewerContextMenuItem
    :itemProps="itemProps"
    tooltip="Edges options"
    :btn_image="btn_image"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch v-model="visibility" />
      <template v-if="visibility">
        <v-row class="pa-0" align="center">
          <v-divider />
          <v-col cols="auto" justify="center">
            <v-icon size="30" icon="mdi-ruler" v-tooltip:left="'Width'" />
          </v-col>
          <v-col justify="center">
            <v-slider
              v-model="size"
              hide-details
              min="0"
              max="20"
              step="2"
              thumb-color="black"
              ticks
            />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <ViewerOptionsColoringTypeSelector
              :id="id"
              v-model:coloring_style_key="coloring_style_key"
              v-model:color="color"
              v-model:vertex_attribute_name="vertex_attribute_name"
              v-model:vertex_attribute_range="vertex_attribute_range"
              v-model:vertex_attribute_color_map="vertex_attribute_color_map"
              v-model:edge_attribute_name="edge_attribute_name"
              v-model:edge_attribute_range="edge_attribute_range"
              v-model:edge_attribute_color_map="edge_attribute_color_map"
              edgeStorePrefix="meshEdgesEdge"
              vertexStorePrefix="meshEdgesVertex"
            />
          </v-col>
        </v-row>
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
