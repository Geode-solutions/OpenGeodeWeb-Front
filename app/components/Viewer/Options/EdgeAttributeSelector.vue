<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"
  import { useDataStyleStore } from "@ogw_front/stores/data_style"
  import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"
  import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar"

  const geodeStore = useGeodeStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const model = defineModel()

  const props = defineProps({
    id: { type: String, required: true },
  })

  const edge_attribute_name = ref("")
  const edge_attribute_names = ref([])

  const selectedAttributeRange = computed(() => {
    const attribute = edge_attribute_names.value.find(
      (attr) => attr.attribute_name === edge_attribute_name.value,
    )
    if (attribute) {
      return [attribute.min_value, attribute.max_value]
    }
    return [0, 1]
  })

  const edge_attribute = reactive({
    name: "",
    minimum: undefined,
    maximum: undefined,
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
      edge_attribute.minimum !== undefined &&
      edge_attribute.maximum !== undefined
    ) {
      dataStyleStore.setAttributeSettings(props.id, "edge", oldName, {
        minimum: edge_attribute.minimum,
        maximum: edge_attribute.maximum,
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
      edge_attribute.minimum = cached.minimum
      edge_attribute.maximum = cached.maximum
      edge_attribute.colorMap = cached.colorMap
    } else {
      const attribute = edge_attribute_names.value.find(
        (attr) => attr.attribute_name === attributeName,
      )
      edge_attribute.minimum = attribute ? attribute.min_value : 0
      edge_attribute.maximum = attribute ? attribute.max_value : 1
      edge_attribute.colorMap = "Cool to Warm"
    }
    nextTick(() => {
      onScalarRangeChange()
      onColorMapChange()
    })
  }

  watch(
    () => [
      edge_attribute.minimum,
      edge_attribute.maximum,
      edge_attribute.colorMap,
    ],
    () => {
      model.value = { ...edge_attribute }
      if (edge_attribute.name) {
        dataStyleStore.setAttributeSettings(
          props.id,
          "edge",
          edge_attribute.name,
          {
            minimum: edge_attribute.minimum,
            maximum: edge_attribute.maximum,
            colorMap: edge_attribute.colorMap,
          },
        )
      }
    },
  )

  function onScalarRangeChange() {
    if (
      edge_attribute.minimum !== undefined &&
      edge_attribute.maximum !== undefined
    ) {
      dataStyleStore.setMeshEdgesEdgeAttributeRange(
        props.id,
        edge_attribute.minimum,
        edge_attribute.maximum,
      )
      onColorMapChange()
    }
  }

  function onColorMapChange() {
    if (
      edge_attribute.minimum !== undefined &&
      edge_attribute.maximum !== undefined &&
      edge_attribute.colorMap
    ) {
      dataStyleStore.setMeshEdgesEdgeAttributeColorMap(
        props.id,
        edge_attribute.colorMap,
        edge_attribute.minimum,
        edge_attribute.maximum,
      )
      hybridViewerStore.remoteRender()
    }
  }

  function get_edge_attribute_names() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.edge_attribute_names,
      { id: props.id },
      {
        response_function: (response) => {
          edge_attribute_names.value = response.attributes
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
        item-title="attribute_name"
        item-value="attribute_name"
        label="Select an edge attribute"
        density="compact"
        hide-details
      />
    </v-col>
    <ViewerOptionsAttributeColorBar
      v-if="edge_attribute_name"
      v-model:minimum="edge_attribute.minimum"
      v-model:maximum="edge_attribute.maximum"
      v-model:colorMap="edge_attribute.colorMap"
      :auto-min="selectedAttributeRange[0]"
      :auto-max="selectedAttributeRange[1]"
      @update:minimum="onScalarRangeChange"
      @update:maximum="onScalarRangeChange"
      @update:colorMap="onColorMapChange"
    />
  </v-row>
</template>
