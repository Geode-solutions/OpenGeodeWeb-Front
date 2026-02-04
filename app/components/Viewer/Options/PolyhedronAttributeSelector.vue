<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"
  import { useDataStyleStore } from "@ogw_front/stores/data_style"
  import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"
  import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar"

  const props = defineProps({
    id: { type: String, required: true },
  })

  const geodeStore = useGeodeStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const polyhedron_attribute_names = ref([])

  const storePolyhedronAttribute = computed(() => {
    return dataStyleStore.meshPolyhedraPolyhedronAttribute?.(props.id) || {}
  })

  const polyhedron_attribute_name = computed({
    get: () => storePolyhedronAttribute.value?.name || "",
    set: (newName) => {
      if (newName) {
        dataStyleStore.setMeshPolyhedraPolyhedronAttributeName(
          props.id,
          newName,
        )
        const attribute = polyhedron_attribute_names.value.find(
          (attr) => attr.attribute_name === newName,
        )
        if (attribute) {
          onScalarRangeChange(attribute.min_value, attribute.max_value)
        }
      }
    },
  })

  const selectedAttributeRange = computed(() => {
    const attribute = polyhedron_attribute_names.value.find(
      (attr) => attr.attribute_name === polyhedron_attribute_name.value,
    )
    if (attribute) {
      return [attribute.min_value, attribute.max_value]
    }
    return [0, 1]
  })

  const minimum = computed({
    get: () => storePolyhedronAttribute.value?.minimum,
    set: (value) =>
      onScalarRangeChange(value, storePolyhedronAttribute.value?.maximum),
  })

  const maximum = computed({
    get: () => storePolyhedronAttribute.value?.maximum,
    set: (value) =>
      onScalarRangeChange(storePolyhedronAttribute.value?.minimum, value),
  })

  const colorMap = computed({
    get: () => storePolyhedronAttribute.value?.colorMap || "Cool to Warm",
    set: (value) => onColorMapChange(value),
  })

  function onScalarRangeChange(min, max) {
    if (min !== undefined && max !== undefined) {
      dataStyleStore.setMeshPolyhedraPolyhedronAttributeRange(
        props.id,
        min,
        max,
      )
      onColorMapChange(colorMap.value, min, max)
    }
  }

  function onColorMapChange(newColorMap, min, max) {
    min = min ?? minimum.value
    max = max ?? maximum.value
    if (min !== undefined && max !== undefined && newColorMap) {
      dataStyleStore.setMeshPolyhedraPolyhedronAttributeColorMap(
        props.id,
        newColorMap,
        min,
        max,
      )
      hybridViewerStore.remoteRender()
    }
  }

  onMounted(() => {
    getPolyhedronAttributes()
  })

  function getPolyhedronAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.polyhedron_attribute_names,
      { id: props.id },
      {
        response_function: (response) => {
          polyhedron_attribute_names.value = response.attributes
        },
      },
    )
  }
</script>

<template>
  <v-select
    v-model="polyhedron_attribute_name"
    :items="polyhedron_attribute_names"
    item-title="attribute_name"
    item-value="attribute_name"
    label="Select an attribute"
    density="compact"
  />
  <ViewerOptionsAttributeColorBar
    v-if="polyhedron_attribute_name"
    v-model:minimum="minimum"
    v-model:maximum="maximum"
    v-model:colorMap="colorMap"
    :auto-min="selectedAttributeRange[0]"
    :auto-max="selectedAttributeRange[1]"
  />
</template>
