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

  const geodeStore = useGeodeStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const model = defineModel()

  const props = defineProps({
    id: { type: String, required: true },
    meshType: { type: String, default: "polygons" },
  })

  const vertex_attribute_name = ref("")
  const vertex_attribute_names = ref([])
  const vertex_attribute_metadata = ref({})

  const selectedAttributeRange = computed(() => {
    if (
      vertex_attribute_name.value &&
      vertex_attribute_metadata.value[vertex_attribute_name.value]
    ) {
      return vertex_attribute_metadata.value[vertex_attribute_name.value]
    }
    return [0, 1]
  })

  const vertex_attribute = reactive({
    name: "",
    min: undefined,
    max: undefined,
    colorMap: "Cool to Warm",
  })

  onMounted(() => {
    if (model.value != null && model.value.name) {
      vertex_attribute_name.value = model.value.name
      loadSettingsForAttribute(model.value.name)
    }
  })

  watch(vertex_attribute_name, (newName, oldName) => {
    if (
      oldName &&
      vertex_attribute.min !== undefined &&
      vertex_attribute.max !== undefined
    ) {
      dataStyleStore.setAttributeSettings(props.id, "vertex", oldName, {
        min: vertex_attribute.min,
        max: vertex_attribute.max,
        colorMap: vertex_attribute.colorMap,
      })
    }

    vertex_attribute.name = newName

    if (newName) {
      loadSettingsForAttribute(newName)
    }

    model.value = { ...vertex_attribute }
  })

  function loadSettingsForAttribute(attributeName) {
    const cached = dataStyleStore.getAttributeSettings(
      props.id,
      "vertex",
      attributeName,
    )
    if (cached) {
      vertex_attribute.min = cached.min
      vertex_attribute.max = cached.max
      vertex_attribute.colorMap = cached.colorMap
    } else {
      const range = vertex_attribute_metadata.value[attributeName]
      vertex_attribute.min = range ? range[0] : 0
      vertex_attribute.max = range ? range[1] : 1
      vertex_attribute.colorMap = "Cool to Warm"
    }
    nextTick(() => {
      onScalarRangeChange()
      onColorMapChange()
    })
  }

  watch(
    () => [
      vertex_attribute.min,
      vertex_attribute.max,
      vertex_attribute.colorMap,
    ],
    () => {
      model.value = { ...vertex_attribute }
      if (vertex_attribute.name) {
        dataStyleStore.setAttributeSettings(
          props.id,
          "vertex",
          vertex_attribute.name,
          {
            min: vertex_attribute.min,
            max: vertex_attribute.max,
            colorMap: vertex_attribute.colorMap,
          },
        )
      }
    },
  )

  function onScalarRangeChange() {
    if (
      vertex_attribute.min !== undefined &&
      vertex_attribute.max !== undefined
    ) {
      dataStyleStore.setVertexScalarRange(
        props.id,
        props.meshType,
        vertex_attribute.min,
        vertex_attribute.max,
      )
      onColorMapChange()
    }
  }

  function onColorMapChange() {
    if (
      vertex_attribute.min !== undefined &&
      vertex_attribute.max !== undefined &&
      vertex_attribute.colorMap
    ) {
      const preset = getRGBPointsFromPreset(vertex_attribute.colorMap)
      if (preset && preset.RGBPoints) {
        const points = convertRGBPointsToSchemaFormat(
          preset.RGBPoints,
          vertex_attribute.min,
          vertex_attribute.max,
        )
        dataStyleStore.setVertexColorMap(
          props.id,
          props.meshType,
          points,
          vertex_attribute.min,
          vertex_attribute.max,
        )
        hybridViewerStore.remoteRender()
      }
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
          const names = []
          const metadata = {}
          for (const attribute of response.attributes) {
            names.push(attribute.attribute_name)
            metadata[attribute.attribute_name] = [
              attribute.min_value,
              attribute.max_value,
            ]
          }
          vertex_attribute_names.value = names
          vertex_attribute_metadata.value = metadata
        },
      },
    )
  }
</script>

<template>
  <div>
    <v-select
      v-model="vertex_attribute_name"
      :items="vertex_attribute_names"
      label="Select an attribute"
      density="compact"
    />
    <ViewerOptionsAttributeColorBar
      v-if="vertex_attribute_name"
      v-model:min="vertex_attribute.min"
      v-model:max="vertex_attribute.max"
      v-model:colorMap="vertex_attribute.colorMap"
      :auto-min="selectedAttributeRange[0]"
      :auto-max="selectedAttributeRange[1]"
      @update:min="onScalarRangeChange"
      @update:max="onScalarRangeChange"
      @update:colorMap="onColorMapChange"
    />
  </div>
</template>
