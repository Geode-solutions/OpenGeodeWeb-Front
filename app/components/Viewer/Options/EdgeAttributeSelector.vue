<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"
  import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar"

  const geodeStore = useGeodeStore()

  const edge_attribute_name = defineModel("edge_attribute_name")
  const edge_attribute_range = defineModel("edge_attribute_range", {
    type: Array,
    default: () => [0, 1],
  })
  const edge_attribute_color_map = defineModel("edge_attribute_color_map")
  const edge_attributes = ref([])

  const props = defineProps({
    id: { type: String, required: true },
  })

  const rangeMin = computed({
    get: () => edge_attribute_range.value?.[0] ?? 0,
    set: (val) => {
      edge_attribute_range.value = [val, edge_attribute_range.value?.[1] ?? 1]
    },
  })
  const rangeMax = computed({
    get: () => edge_attribute_range.value?.[1] ?? 1,
    set: (val) => {
      edge_attribute_range.value = [edge_attribute_range.value?.[0] ?? 0, val]
    },
  })

  onMounted(() => {
    getEdgeAttributes()
  })

  function getEdgeAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.edge_attribute_names,
      { id: props.id },
      {
        response_function: (response) => {
          edge_attributes.value = response.attributes
        },
      },
    )
  }

  const currentAttribute = computed(() => {
    return edge_attributes.value.find(
      (attr) => attr.attribute_name === edge_attribute_name.value,
    )
  })

  watch(edge_attribute_name, (newName) => {
    if (newName) {
      const attr = edge_attributes.value.find(
        (a) => a.attribute_name === newName,
      )
      if (
        attr &&
        attr.min_value !== undefined &&
        attr.max_value !== undefined
      ) {
        const currentRange = edge_attribute_range.value
        const hasNoSavedPreset =
          !currentRange || (currentRange[0] === 0 && currentRange[1] === 1)
        if (hasNoSavedPreset) {
          if (!edge_attribute_color_map.value) {
            edge_attribute_color_map.value = "Cool to Warm"
          }
          edge_attribute_range.value = [attr.min_value, attr.max_value]
        }
      }
    }
  })

  function resetRange() {
    if (currentAttribute.value) {
      edge_attribute_range.value = [
        currentAttribute.value.min_value,
        currentAttribute.value.max_value,
      ]
    }
  }
</script>

<template>
  <v-select
    v-model="edge_attribute_name"
    :items="edge_attributes.map((attribute) => attribute.attribute_name)"
    item-title="attribute_name"
    item-value="attribute_name"
    label="Select an attribute"
    density="compact"
  />
  <ViewerOptionsAttributeColorBar
    v-if="edge_attribute_name"
    v-model:minimum="rangeMin"
    v-model:maximum="rangeMax"
    v-model:colorMap="edge_attribute_color_map"
    @reset="resetRange"
  />
</template>
