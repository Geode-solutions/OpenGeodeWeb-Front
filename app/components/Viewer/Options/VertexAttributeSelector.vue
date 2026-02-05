<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"
  import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar"

  const geodeStore = useGeodeStore()

  const vertex_attribute_name = defineModel("vertex_attribute_name")
  const vertex_attribute_range = defineModel("vertex_attribute_range", {
    type: Array,
    default: () => [0, 1],
  })
  const vertex_attribute_color_map = defineModel("vertex_attribute_color_map")
  const vertex_attributes = ref([])

  const selectedName = ref(vertex_attribute_name.value)

  watch(vertex_attribute_name, (newVal) => {
    selectedName.value = newVal
  })

  const props = defineProps({
    id: { type: String, required: true },
  })

  const rangeMin = computed({
    get: () => vertex_attribute_range.value?.[0] ?? 0,
    set: (val) => {
      vertex_attribute_range.value = [
        val,
        vertex_attribute_range.value?.[1] ?? 1,
      ]
    },
  })
  const rangeMax = computed({
    get: () => vertex_attribute_range.value?.[1] ?? 1,
    set: (val) => {
      vertex_attribute_range.value = [
        vertex_attribute_range.value?.[0] ?? 0,
        val,
      ]
    },
  })

  onMounted(() => {
    getVertexAttributes()
  })

  function getVertexAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.vertex_attribute_names,
      { id: props.id },
      {
        response_function: (response) => {
          vertex_attributes.value = response.attributes
        },
      },
    )
  }

  const emit = defineEmits(["attribute-selected"])

  watch(selectedName, (newName) => {
    if (!newName) return
    const attribute = vertex_attributes.value.find(
      (attr) => attr.attribute_name === newName,
    )
    if (attribute && attribute.min_value !== -1 && attribute.max_value !== -1) {
      emit("attribute-selected", {
        name: newName,
        defaultMin: attribute.min_value,
        defaultMax: attribute.max_value,
      })
    }
  })
  const currentAttribute = computed(() => {
    return vertex_attributes.value.find(
      (attr) => attr.attribute_name === selectedName.value,
    )
  })
</script>

<template>
  <v-select
    v-model="selectedName"
    :items="vertex_attributes.map((attribute) => attribute.attribute_name)"
    item-title="attribute_name"
    item-value="attribute_name"
    label="Select an attribute"
    density="compact"
  />
  <ViewerOptionsAttributeColorBar
    v-if="vertex_attribute_name && vertex_attribute_range"
    v-model:minimum="rangeMin"
    v-model:maximum="rangeMax"
    v-model:colorMap="vertex_attribute_color_map"
    :autoMin="currentAttribute?.min_value"
    :autoMax="currentAttribute?.max_value"
  />
</template>
