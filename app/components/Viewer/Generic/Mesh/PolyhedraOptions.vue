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
</script>
<template>
  <ViewerContextMenuItem
    :itemProps="props.itemProps"
    :tooltip="props.tooltip"
    :btn_image="props.btn_image"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch v-model="visibility" />
      <template v-if="visibility">
        <ViewerOptionsColoringTypeSelector
          :id="id"
          v-model:coloring_style_key="coloring_style_key"
          v-model:color="color"
          v-model:vertex_attribute="vertex_attribute"
          v-model:polyhedron_attribute="polyhedron_attribute"
          mesh-type="polyhedra"
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
