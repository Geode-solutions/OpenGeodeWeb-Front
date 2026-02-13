<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"
  import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar"

  const geodeStore = useGeodeStore()

  const polygon_attribute_name = defineModel("polygon_attribute_name", {
    type: String,
  })
  const polygon_attribute_range = defineModel("polygon_attribute_range", {
    type: Array,
  })
  const polygon_attribute_color_map = defineModel(
    "polygon_attribute_color_map",
    { type: String },
  )
  const polygon_attributes = ref([])

  const props = defineProps({
    id: { type: String, required: true },
  })

  const rangeMin = computed({
    get: () => polygon_attribute_range.value[0],
    set: (val) => {
      polygon_attribute_range.value = [val, polygon_attribute_range.value[1]]
    },
  })
  const rangeMax = computed({
    get: () => polygon_attribute_range.value[1],
    set: (val) => {
      polygon_attribute_range.value = [polygon_attribute_range.value[0], val]
    },
  })

  onMounted(() => {
    getPolygonAttributes()
  })

  function getPolygonAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.polygon_attribute_names,
      { id: props.id },
      {
        response_function: (response) => {
          polygon_attributes.value = response.attributes
        },
      },
    )
  }

  const currentAttribute = computed(() => {
    return polygon_attributes.value.find(
      (attr) => attr.attribute_name === polygon_attribute_name.value,
    )
  })

  function resetRange() {
    if (currentAttribute.value) {
      polygon_attribute_range.value = [
        currentAttribute.value.min_value,
        currentAttribute.value.max_value,
      ]
    }
  }
</script>

<template>
  <v-select
    v-model="polygon_attribute_name"
    :items="polygon_attributes.map((attribute) => attribute.attribute_name)"
    item-title="attribute_name"
    item-value="attribute_name"
    label="Select an attribute"
    density="compact"
  />
  <ViewerOptionsAttributeColorBar
    v-if="polygon_attribute_name"
    v-model:minimum="rangeMin"
    v-model:maximum="rangeMax"
    v-model:colorMap="polygon_attribute_color_map"
    @reset="resetRange"
  />
</template>
