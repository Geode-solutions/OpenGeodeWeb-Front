<template>
  <ViewerContextMenuItem
    :itemProps="props.itemProps"
    tooltip="Points options"
    :btn_image="SurfacePoints"
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
      </template>
    </template>
  </ViewerContextMenuItem>
</template>

<script setup>
  import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenuItem.vue"
  import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue"
  import SurfacePoints from "@ogw_front/assets/viewer_svgs/surface_points.svg"

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
    get: () => dataStyleStore.modelPointsVisibility(id.value),
    set: (newValue) => {
      dataStyleStore.setModelPointsVisibility(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
  const size = computed({
    get: () => dataStyleStore.modelPointsSize(id.value),
    set: (newValue) => {
      dataStyleStore.setModelPointsSize(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
</script>
