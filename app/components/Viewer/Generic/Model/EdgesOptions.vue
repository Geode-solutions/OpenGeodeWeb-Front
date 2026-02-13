<script setup>
  import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenuItem"
  import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch"
  import SurfaceEdges from "@ogw_front/assets/viewer_svgs/surface_edges.svg"

  import { useDataStyleStore } from "@ogw_front/stores/data_style"
  import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"

  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const props = defineProps({
    itemProps: { type: Object, required: true },
  })

  const id = toRef(() => props.itemProps.id)

  const visibility = computed({
    get: () => dataStyleStore.modelEdgesVisibility(id.value),
    set: async (newValue) => {
      await dataStyleStore.setModelEdgesVisibility(id.value, newValue)
      hybridViewerStore.remoteRender()
    },
  })
</script>

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
