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
  })

  const edge_attribute_names = ref([])

  const storeEdgeAttribute = computed(() => {
    return dataStyleStore.meshEdgesEdgeAttribute?.(props.id) || {}
  })

  const edge_attribute_name = computed({
    get: () => storeEdgeAttribute.value?.name || "",
    set: (newName) => {
      if (newName) {
        const attribute = edge_attribute_names.value.find(
          (attr) => attr.attribute_name === newName,
        )
        if (attribute) {
          dataStyleStore
            .setMeshEdgesEdgeAttributeName(
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
            .setMeshEdgesEdgeAttributeName(props.id, newName)
            .then(() => {
              hybridViewerStore.remoteRender()
            })
        }
      }
    },
  })

  const selectedAttributeRange = computed(() => {
    const attribute = edge_attribute_names.value.find(
      (attr) => attr.attribute_name === edge_attribute_name.value,
    )
    if (attribute) {
      return [attribute.min_value, attribute.max_value]
    }
    return [0, 1]
  })

  const minimum = computed({
    get: () => storeEdgeAttribute.value?.minimum,
    set: (value) =>
      onScalarRangeChange(value, storeEdgeAttribute.value?.maximum),
  })

  const maximum = computed({
    get: () => storeEdgeAttribute.value?.maximum,
    set: (value) =>
      onScalarRangeChange(storeEdgeAttribute.value?.minimum, value),
  })

  const colorMap = computed({
    get: () => storeEdgeAttribute.value?.colorMap || "Cool to Warm",
    set: (value) => onColorMapChange(value),
  })

  function onScalarRangeChange(min, max) {
    if (min !== undefined && max !== undefined) {
      dataStyleStore.setMeshEdgesEdgeAttributeRange(props.id, min, max)
      onColorMapChange(colorMap.value, min, max)
    }
  }

  function onColorMapChange(newColorMap, min, max) {
    min = min ?? minimum.value
    max = max ?? maximum.value
    if (min !== undefined && max !== undefined && newColorMap) {
      dataStyleStore.setMeshEdgesEdgeAttributeColorMap(
        props.id,
        newColorMap,
        min,
        max,
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
      v-model:minimum="minimum"
      v-model:maximum="maximum"
      v-model:colorMap="colorMap"
      :auto-min="selectedAttributeRange[0]"
      :auto-max="selectedAttributeRange[1]"
    />
  </v-row>
</template>
