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
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>

<script setup>
  const dataStyleStore = useDataStyleStore()

  const props = defineProps({
    itemProps: { type: Object, required: true },
    btn_image: { type: String, required: true },
    tooltip: { type: String, required: false, default: "Polyhedra options" },
  })

  const id = toRef(() => props.itemProps.id)

  const visibility = computed({
    get: () => dataStyleStore.meshPolyhedraVisibility(id.value),
    set: (newValue) =>
      dataStyleStore.setMeshPolyhedraVisibility(id.value, newValue),
  })
  const coloring_style_key = computed({
    get: () => dataStyleStore.meshPolyhedraActiveColoring(id.value),
    set: (newValue) =>
      dataStyleStore.setMeshPolyhedraActiveColoring(id.value, newValue),
  })
  const color = computed({
    get: () => dataStyleStore.meshPolyhedraColor(id.value),
    set: (newValue) => dataStyleStore.setMeshPolyhedraColor(id.value, newValue),
  })
  const vertex_attribute = computed({
    get: () => dataStyleStore.polyhedraVertexAttribute(id.value),
    set: (newValue) =>
      dataStyleStore.setPolyhedraVertexAttribute(id.value, newValue),
  })
  const polyhedron_attribute = computed({
    get: () => dataStyleStore.polyhedraPolyhedronAttribute(id.value),
    set: (newValue) =>
      dataStyleStore.setPolyhedraPolyhedronAttribute(id.value, newValue),
  })
</script>
