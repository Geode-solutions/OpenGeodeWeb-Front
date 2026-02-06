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
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
