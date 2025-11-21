<template>
  <ViewerContextMenuItem
    :itemProps="itemProps"
    tooltip="Edges options"
    :btn_image="SurfaceEdges"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch v-model="visibility" />
    </template>
  </ViewerContextMenuItem>
</template>

<script setup>
  import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenuItem.vue"
  import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue"
  import SurfaceEdges from "@ogw_front/assets/viewer_svgs/surface_edges.svg"

  const props = defineProps({
    itemProps: { type: Object, required: true },
    btn_image: { type: String, required: true },
  })

  const id = toRef(() => props.itemProps.id)
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const visibility = computed({
    get: () => dataStyleStore.modelEdgesVisibility(id.value),
    set: (newValue) => {
      dataStyleStore.setModelEdgesVisibility(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
</script>
