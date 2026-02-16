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
  })

  const id = toRef(() => props.itemProps.id)

  const visibility = computed({
    get: () => dataStyleStore.meshPointsVisibility(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshPointsVisibility(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const size = computed({
    get: () => dataStyleStore.meshPointsSize(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshPointsSize(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const coloring_style_key = computed({
    get: () => dataStyleStore.meshPointsActiveColoring(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshPointsActiveColoring(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const color = computed({
    get: () => dataStyleStore.meshPointsColor(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshPointsColor(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
</script>

<template>
  <ViewerContextMenuItem
    :itemProps="props.itemProps"
    tooltip="Points options"
    :btn_image="props.btn_image"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch v-model="visibility" />
      <template v-if="visibility">
        <v-row class="pa-0" align="center">
          <v-divider />
          <v-col cols="auto" justify="center">
            <v-icon size="30" icon="mdi-ruler" v-tooltip:left="'Size'" />
          </v-col>
          <v-col justify="center">
            <v-slider v-model="size" hide-details min="0" max="20" step="2" />
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <ViewerOptionsColoringTypeSelector
              :id="id"
              v-model:coloring_style_key="coloring_style_key"
              v-model:color="color"
              v-model:vertex_attribute="vertex_attribute"
            />
          </v-col>
        </v-row>
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
