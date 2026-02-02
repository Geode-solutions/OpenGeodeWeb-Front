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
  })

  const edge_attribute_name = ref("")
  const edge_attribute_names = ref([])
  const edge_attribute_metadata = ref({})

  const selectedAttributeRange = computed(() => {
    if (
      edge_attribute_name.value &&
      edge_attribute_metadata.value[edge_attribute_name.value]
    ) {
      return edge_attribute_metadata.value[edge_attribute_name.value]
    }
    return [0, 1]
  })

  const edge_attribute = reactive({
    name: "",
    min: undefined,
    max: undefined,
    colorMap: "Cool to Warm",
  })

  onMounted(() => {
    if (model.value != null && model.value.name) {
      edge_attribute_name.value = model.value.name
      loadSettingsForAttribute(model.value.name)
    }
  })

  watch(edge_attribute_name, (newName, oldName) => {
    if (
      oldName &&
      edge_attribute.min !== undefined &&
      edge_attribute.max !== undefined
    ) {
      dataStyleStore.setAttributeSettings(props.id, "edge", oldName, {
        min: edge_attribute.min,
        max: edge_attribute.max,
        colorMap: edge_attribute.colorMap,
      })
    }
    edge_attribute.name = newName
    if (newName) {
      loadSettingsForAttribute(newName)
    }
    model.value = { ...edge_attribute }
  })

  function loadSettingsForAttribute(attributeName) {
    const cached = dataStyleStore.getAttributeSettings(
      props.id,
      "edge",
      attributeName,
    )
    if (cached) {
      edge_attribute.min = cached.min
      edge_attribute.max = cached.max
      edge_attribute.colorMap = cached.colorMap
    } else {
      const range = edge_attribute_metadata.value[attributeName]
      edge_attribute.min = range ? range[0] : 0
      edge_attribute.max = range ? range[1] : 1
      edge_attribute.colorMap = "Cool to Warm"
    }
    nextTick(() => {
      onScalarRangeChange()
      onColorMapChange()
    })
  }

  watch(
    () => [edge_attribute.min, edge_attribute.max, edge_attribute.colorMap],
    () => {
      model.value = { ...edge_attribute }
      if (edge_attribute.name) {
        dataStyleStore.setAttributeSettings(
          props.id,
          "edge",
          edge_attribute.name,
          {
            min: edge_attribute.min,
            max: edge_attribute.max,
            colorMap: edge_attribute.colorMap,
          },
        )
      }
    },
  )

  function onScalarRangeChange() {
    if (edge_attribute.min !== undefined && edge_attribute.max !== undefined) {
      dataStyleStore.setMeshEdgesVertexScalarRange(
        props.id,
        edge_attribute.min,
        edge_attribute.max,
      )
      onColorMapChange()
    }
  }

  function onColorMapChange() {
    if (
      edge_attribute.min !== undefined &&
      edge_attribute.max !== undefined &&
      edge_attribute.colorMap
    ) {
      const preset = getRGBPointsFromPreset(edge_attribute.colorMap)
      if (preset && preset.RGBPoints) {
        const points = convertRGBPointsToSchemaFormat(
          preset.RGBPoints,
          edge_attribute.min,
          edge_attribute.max,
        )
        dataStyleStore.setMeshEdgesVertexColorMap(
          props.id,
          points,
          edge_attribute.min,
          edge_attribute.max,
        )
        hybridViewerStore.remoteRender()
      }
    }
  }

  function get_edge_attribute_names() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.edge_attribute_names,
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
          edge_attribute_names.value = names
          edge_attribute_metadata.value = metadata
        },
      },
    )
  }

  onMounted(() => {
    get_edge_attribute_names()
  })

  watch(
    () => props.id,
    () => {
      get_edge_attribute_names()
    },
  )
</script>

<template>
  <div>
    <v-row justify="center" align="center">
      <v-col cols="auto">
        <v-icon
          size="30"
          icon="mdi-ray-end-arrow"
          v-tooltip:left="'Edge Attribute'"
        />
      </v-col>
      <v-col>
        <v-select
          v-model="edge_attribute_name"
          :items="edge_attribute_names"
          label="Select an edge attribute"
          density="compact"
          hide-details
        />
      </v-col>
    </v-row>
    <ViewerOptionsAttributeColorBar
      v-if="edge_attribute_name"
      v-model:min="edge_attribute.min"
      v-model:max="edge_attribute.max"
      v-model:colorMap="edge_attribute.colorMap"
      :auto-min="selectedAttributeRange[0]"
      :auto-max="selectedAttributeRange[1]"
      @update:min="onScalarRangeChange"
      @update:max="onScalarRangeChange"
      @update:colorMap="onColorMapChange"
    />
  </div>
</template>
