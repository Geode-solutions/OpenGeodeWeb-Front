<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"
  import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar"

  const geodeStore = useGeodeStore()

  const vertex_attribute_name = defineModel("vertex_attribute_name", {
    type: String,
  })
  const vertex_attribute_range = defineModel("vertex_attribute_range", {
    type: Array,
  })
  const vertex_attribute_color_map = defineModel("vertex_attribute_color_map", {
    type: String,
  })
  const vertex_attributes = ref([])

  const { id } = defineProps({
    id: { type: String, required: true },
  })

  const rangeMin = computed({
    get: () => vertex_attribute_range.value[0],
    set: (val) => {
      vertex_attribute_range.value = [val, vertex_attribute_range.value[1]]
    },
  })
  const rangeMax = computed({
    get: () => vertex_attribute_range.value[1],
    set: (val) => {
      vertex_attribute_range.value = [vertex_attribute_range.value[0], val]
    },
  })

  onMounted(() => {
    getVertexAttributes()
  })

  function getVertexAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.vertex_attribute_names,
      { id: id },
      {
        response_function: (response) => {
          vertex_attributes.value = response.attributes
        },
      },
    )
  }

  const currentAttribute = computed(() => {
    return vertex_attributes.value.find(
      (attr) => attr.attribute_name === vertex_attribute_name.value,
    )
  })

  function resetRange() {
    if (currentAttribute.value) {
      vertex_attribute_range.value = [
        currentAttribute.value.min_value,
        currentAttribute.value.max_value,
      ]
    }
  }
</script>

<template>
  <v-select
    v-model="vertex_attribute_name"
    :items="vertex_attributes.map((attribute) => attribute.attribute_name)"
    item-title="attribute_name"
    item-value="attribute_name"
    label="Select an attribute"
    density="compact"
  />
  <ViewerOptionsAttributeColorBar
    v-if="vertex_attribute_name"
    v-model:minimum="rangeMin"
    v-model:maximum="rangeMax"
    v-model:colorMap="vertex_attribute_color_map"
    @reset="resetRange"
  />
</template>
