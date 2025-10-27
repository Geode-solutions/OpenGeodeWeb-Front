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
          v-model:textures="textures"
          v-model:vertex_attribute="vertex_attribute"
          v-model:polygon_attribute="polygon_attribute"
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
    tooltip: { type: String, required: false, default: "Polygons options" },
  })

  const id = toRef(() => props.itemProps.id)

  const visibility = computed({
    get: () => dataStyleStore.meshPolygonsVisibility(id.value),
    set: (newValue) =>
      dataStyleStore.setMeshPolygonsVisibility(id.value, newValue),
  })
  const coloring_style_key = computed({
    get: () => dataStyleStore.meshPolygonsActiveColoring(id.value),
    set: (newValue) =>
      dataStyleStore.setMeshPolygonsActiveColoring(id.value, newValue),
  })
  const color = computed({
    get: () => dataStyleStore.meshPolygonsColor(id.value),
    set: (newValue) => dataStyleStore.setMeshPolygonsColor(id.value, newValue),
  })
  const textures = computed({
    get: () => dataStyleStore.meshPolygonsTextures(id.value),
    set: (newValue) =>
      dataStyleStore.setMeshPolygonsTextures(id.value, newValue),
  })
  const vertex_attribute = computed({
    get: () => dataStyleStore.meshPolygonsVertexAttribute(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshPolygonsVertexAttribute(id.value, newValue)
    },
  })
  const polygon_attribute = computed({
    get: () => dataStyleStore.meshPolygonsPolygonAttribute(id.value),
    set: (newValue) => {
      dataStyleStore.setMeshPolygonsPolygonAttribute(id.value, newValue)
    },
  })
</script>
