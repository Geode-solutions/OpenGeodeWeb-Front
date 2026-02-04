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

  const cell_attribute_names = ref([])

  const storeCellAttribute = computed(() => {
    return dataStyleStore.meshCellsCellAttribute?.(props.id) || {}
  })

  const cell_attribute_name = computed({
    get: () => storeCellAttribute.value?.name || "",
    set: (newName) => {
      if (newName) {
        const attribute = cell_attribute_names.value.find(
          (attr) => attr.attribute_name === newName,
        )
        if (attribute) {
          dataStyleStore
            .setMeshCellsCellAttributeName(
              props.id,
              newName,
              attribute.min_value,
              attribute.max_value,
            )
            .then(() => {
              hybridViewerStore.remoteRender()
            })
        } else {
          dataStyleStore
            .setMeshCellsCellAttributeName(props.id, newName)
            .then(() => {
              hybridViewerStore.remoteRender()
            })
        }
      }
    },
  })

  const selectedAttributeRange = computed(() => {
    const attribute = cell_attribute_names.value.find(
      (attr) => attr.attribute_name === cell_attribute_name.value,
    )
    if (attribute) {
      return [attribute.min_value, attribute.max_value]
    }
    return [0, 1]
  })

  const minimum = computed({
    get: () => storeCellAttribute.value?.minimum,
    set: (value) =>
      onScalarRangeChange(value, storeCellAttribute.value?.maximum),
  })

  const maximum = computed({
    get: () => storeCellAttribute.value?.maximum,
    set: (value) =>
      onScalarRangeChange(storeCellAttribute.value?.minimum, value),
  })

  const colorMap = computed({
    get: () => storeCellAttribute.value?.colorMap || "Cool to Warm",
    set: (value) => onColorMapChange(value),
  })

  function onScalarRangeChange(min, max) {
    if (min !== undefined && max !== undefined) {
      dataStyleStore.setMeshCellsCellAttributeRange(props.id, min, max)
      onColorMapChange(colorMap.value, min, max)
    }
  }

  function onColorMapChange(newColorMap, min, max) {
    min = min ?? minimum.value
    max = max ?? maximum.value
    if (min !== undefined && max !== undefined && newColorMap) {
      dataStyleStore.setMeshCellsCellAttributeColorMap(
        props.id,
        newColorMap,
        min,
        max,
      )
      hybridViewerStore.remoteRender()
    }
  }

  onMounted(() => {
    getCellAttributes()
  })

  function getCellAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.cell_attribute_names,
      { id: props.id },
      {
        response_function: (response) => {
          cell_attribute_names.value = response.attributes
        },
      },
    )
  }
</script>

<template>
  <v-select
    v-model="cell_attribute_name"
    :items="cell_attribute_names"
    item-title="attribute_name"
    item-value="attribute_name"
    label="Select an attribute"
    density="compact"
  />
  <ViewerOptionsAttributeColorBar
    v-if="cell_attribute_name"
    v-model:minimum="minimum"
    v-model:maximum="maximum"
    v-model:colorMap="colorMap"
    :auto-min="selectedAttributeRange[0]"
    :auto-max="selectedAttributeRange[1]"
  />
</template>
