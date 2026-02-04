<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"
  import { useDataStyleStore } from "@ogw_front/stores/data_style"
  import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"
  import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar"

  const geodeStore = useGeodeStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const props = defineProps({
    id: { type: String, required: true },
    meshType: { type: String, default: "polygons" },
  })

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)

  const vertex_attribute_names = ref([])

  const storeVertexAttribute = computed(() => {
    const methodName = `mesh${capitalize(props.meshType)}VertexAttribute`
    return dataStyleStore[methodName]?.(props.id) || {}
  })

  const vertex_attribute_name = computed({
    get: () => storeVertexAttribute.value?.name || "",
    set: (newName) => {
      if (newName) {
        const methodName = `setMesh${capitalize(props.meshType)}VertexAttributeName`
        dataStyleStore[methodName](props.id, newName)
        const attribute = vertex_attribute_names.value.find(
          (attr) => attr.attribute_name === newName,
        )
        if (attribute) {
          onScalarRangeChange(attribute.min_value, attribute.max_value)
        }
      }
    },
  })

  const selectedAttributeRange = computed(() => {
    const attribute = vertex_attribute_names.value.find(
      (attr) => attr.attribute_name === vertex_attribute_name.value,
    )
    if (attribute) {
      return [attribute.min_value, attribute.max_value]
    }
    return [0, 1]
  })

  const minimum = computed({
    get: () => storeVertexAttribute.value?.minimum,
    set: (value) =>
      onScalarRangeChange(value, storeVertexAttribute.value?.maximum),
  })

  const maximum = computed({
    get: () => storeVertexAttribute.value?.maximum,
    set: (value) =>
      onScalarRangeChange(storeVertexAttribute.value?.minimum, value),
  })

  const colorMap = computed({
    get: () => storeVertexAttribute.value?.colorMap || "Cool to Warm",
    set: (value) => onColorMapChange(value),
  })

  function onScalarRangeChange(min, max) {
    if (min !== undefined && max !== undefined) {
      const methodName = `setMesh${capitalize(props.meshType)}VertexAttributeRange`
      dataStyleStore[methodName](props.id, min, max)
      onColorMapChange(colorMap.value, min, max)
    }
  }

  function onColorMapChange(newColorMap, min, max) {
    min = min ?? minimum.value
    max = max ?? maximum.value
    if (min !== undefined && max !== undefined && newColorMap) {
      const methodName = `setMesh${capitalize(props.meshType)}VertexAttributeColorMap`
      dataStyleStore[methodName](props.id, newColorMap, min, max)
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
          vertex_attribute_names.value = response.attributes
        },
      },
    )
  }
</script>

<template>
  <v-select
    v-model="vertex_attribute_name"
    :items="vertex_attribute_names"
    item-title="attribute_name"
    item-value="attribute_name"
    label="Select an attribute"
    density="compact"
  />
  <ViewerOptionsAttributeColorBar
    v-if="vertex_attribute_name"
    v-model:minimum="minimum"
    v-model:maximum="maximum"
    v-model:colorMap="colorMap"
    :auto-min="selectedAttributeRange[0]"
    :auto-max="selectedAttributeRange[1]"
  />
</template>
