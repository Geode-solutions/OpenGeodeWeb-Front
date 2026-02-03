<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"
  import { useDataStyleStore } from "@ogw_front/stores/data_style"
  import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"
  import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar"

  const props = defineProps({
    id: { type: String, required: true },
  })

  const model = defineModel()
  const cell_attribute_name = ref("")
  const cell_attribute_names = ref([])

  const geodeStore = useGeodeStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const selectedAttributeRange = computed(() => {
    const attribute = cell_attribute_names.value.find(
      (attr) => attr.attribute_name === cell_attribute_name.value,
    )
    if (attribute) {
      return [attribute.min_value, attribute.max_value]
    }
    return [0, 1]
  })

  const cell_attribute = reactive({
    name: "",
    minimum: undefined,
    maximum: undefined,
    colorMap: "Cool to Warm",
  })

  onMounted(() => {
    if (model.value != null && model.value.name) {
      cell_attribute_name.value = model.value.name
      loadSettingsForAttribute(model.value.name)
    }
  })

  watch(cell_attribute_name, (newName, oldName) => {
    if (
      oldName &&
      cell_attribute.minimum !== undefined &&
      cell_attribute.maximum !== undefined
    ) {
      dataStyleStore.setAttributeSettings(props.id, "cell", oldName, {
        minimum: cell_attribute.minimum,
        maximum: cell_attribute.maximum,
        colorMap: cell_attribute.colorMap,
      })
    }
    cell_attribute.name = newName
    if (newName) {
      loadSettingsForAttribute(newName)
    }
    model.value = { ...cell_attribute }
  })

  function loadSettingsForAttribute(attributeName) {
    const cached = dataStyleStore.getAttributeSettings(
      props.id,
      "cell",
      attributeName,
    )
    if (cached) {
      cell_attribute.minimum = cached.minimum
      cell_attribute.maximum = cached.maximum
      cell_attribute.colorMap = cached.colorMap
    } else {
      const attribute = cell_attribute_names.value.find(
        (attr) => attr.attribute_name === attributeName,
      )
      cell_attribute.minimum = attribute ? attribute.min_value : 0
      cell_attribute.maximum = attribute ? attribute.max_value : 1
      cell_attribute.colorMap = "Cool to Warm"
    }
    // Apply the loaded settings to the viewer
    nextTick(() => {
      onScalarRangeChange()
      onColorMapChange()
    })
  }

  watch(
    () => [
      cell_attribute.minimum,
      cell_attribute.maximum,
      cell_attribute.colorMap,
    ],
    () => {
      model.value = { ...cell_attribute }
      if (cell_attribute.name) {
        dataStyleStore.setAttributeSettings(
          props.id,
          "cell",
          cell_attribute.name,
          {
            minimum: cell_attribute.minimum,
            maximum: cell_attribute.maximum,
            colorMap: cell_attribute.colorMap,
          },
        )
      }
    },
  )

  function onScalarRangeChange() {
    if (
      cell_attribute.minimum !== undefined &&
      cell_attribute.maximum !== undefined
    ) {
      dataStyleStore.setMeshCellsCellAttributeRange(
        props.id,
        cell_attribute.minimum,
        cell_attribute.maximum,
      )
      onColorMapChange()
    }
  }

  function onColorMapChange() {
    if (
      cell_attribute.minimum !== undefined &&
      cell_attribute.maximum !== undefined &&
      cell_attribute.colorMap
    ) {
      dataStyleStore.setMeshCellsCellAttributeColorMap(
        props.id,
        cell_attribute.colorMap,
        cell_attribute.minimum,
        cell_attribute.maximum,
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
    v-model:minimum="cell_attribute.minimum"
    v-model:maximum="cell_attribute.maximum"
    v-model:colorMap="cell_attribute.colorMap"
    :auto-min="selectedAttributeRange[0]"
    :auto-max="selectedAttributeRange[1]"
    @update:minimum="onScalarRangeChange"
    @update:maximum="onScalarRangeChange"
    @update:colorMap="onColorMapChange"
  />
</template>
