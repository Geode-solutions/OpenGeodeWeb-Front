<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"
  import { useDataStyleStore } from "@ogw_front/stores/data_style"
  import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"
  import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar"
  import {
    getRGBPointsFromPreset,
    convertRGBPointsToSchemaFormat,
  } from "@ogw_front/utils/colormap"

  const props = defineProps({
    id: { type: String, required: true },
  })

  const model = defineModel()
  const cell_attribute_name = ref("")
  const cell_attribute_names = ref([])
  const cell_attribute_metadata = ref({})

  const geodeStore = useGeodeStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const selectedAttributeRange = computed(() => {
    if (
      cell_attribute_name.value &&
      cell_attribute_metadata.value[cell_attribute_name.value]
    ) {
      return cell_attribute_metadata.value[cell_attribute_name.value]
    }
    return [0, 1]
  })

  const cell_attribute = reactive({
    name: "",
    min: undefined,
    max: undefined,
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
      cell_attribute.min !== undefined &&
      cell_attribute.max !== undefined
    ) {
      dataStyleStore.setAttributeSettings(props.id, "cell", oldName, {
        min: cell_attribute.min,
        max: cell_attribute.max,
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
      cell_attribute.min = cached.min
      cell_attribute.max = cached.max
      cell_attribute.colorMap = cached.colorMap
    } else {
      const range = cell_attribute_metadata.value[attributeName]
      cell_attribute.min = range ? range[0] : 0
      cell_attribute.max = range ? range[1] : 1
      cell_attribute.colorMap = "Cool to Warm"
    }
    // Apply the loaded settings to the viewer
    nextTick(() => {
      onScalarRangeChange()
      onColorMapChange()
    })
  }

  watch(
    () => [cell_attribute.min, cell_attribute.max, cell_attribute.colorMap],
    () => {
      model.value = { ...cell_attribute }
      if (cell_attribute.name) {
        dataStyleStore.setAttributeSettings(
          props.id,
          "cell",
          cell_attribute.name,
          {
            min: cell_attribute.min,
            max: cell_attribute.max,
            colorMap: cell_attribute.colorMap,
          },
        )
      }
    },
  )

  function onScalarRangeChange() {
    if (cell_attribute.min !== undefined && cell_attribute.max !== undefined) {
      dataStyleStore.setMeshCellsCellScalarRange(
        props.id,
        cell_attribute.min,
        cell_attribute.max,
      )
      onColorMapChange()
    }
  }

  function onColorMapChange() {
    if (
      cell_attribute.min !== undefined &&
      cell_attribute.max !== undefined &&
      cell_attribute.colorMap
    ) {
      const preset = getRGBPointsFromPreset(cell_attribute.colorMap)
      if (preset && preset.RGBPoints) {
        const points = convertRGBPointsToSchemaFormat(
          preset.RGBPoints,
          cell_attribute.min,
          cell_attribute.max,
        )
        dataStyleStore.setMeshCellsCellColorMap(
          props.id,
          points,
          cell_attribute.min,
          cell_attribute.max,
        )
        hybridViewerStore.remoteRender()
      }
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
          const names = []
          const metadata = {}
          for (const attribute of response.attributes) {
            names.push(attribute.attribute_name)
            metadata[attribute.attribute_name] = [
              attribute.min_value,
              attribute.max_value,
            ]
          }
          cell_attribute_names.value = names
          cell_attribute_metadata.value = metadata
        },
      },
    )
  }
</script>

<template>
  <div>
    <v-select
      v-model="cell_attribute_name"
      :items="cell_attribute_names"
      label="Select an attribute"
      density="compact"
    />
    <ViewerOptionsAttributeColorBar
      v-if="cell_attribute_name"
      v-model:min="cell_attribute.min"
      v-model:max="cell_attribute.max"
      v-model:colorMap="cell_attribute.colorMap"
      :auto-min="selectedAttributeRange[0]"
      :auto-max="selectedAttributeRange[1]"
      @update:min="onScalarRangeChange"
      @update:max="onScalarRangeChange"
      @update:colorMap="onColorMapChange"
    />
  </div>
</template>
