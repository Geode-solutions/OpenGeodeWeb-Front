<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"
  import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar"

  const geodeStore = useGeodeStore()

  const polyhedron_attribute_name = defineModel("polyhedron_attribute_name")
  const polyhedron_attribute_range = defineModel("polyhedron_attribute_range", {
    type: Array,
    default: () => [0, 1],
  })
  const polyhedron_attribute_color_map = defineModel(
    "polyhedron_attribute_color_map",
  )
  const polyhedron_attributes = ref([])

  const props = defineProps({
    id: { type: String, required: true },
  })

  const rangeMin = computed({
    get: () => polyhedron_attribute_range.value?.[0] ?? 0,
    set: (val) => {
      polyhedron_attribute_range.value = [
        val,
        polyhedron_attribute_range.value?.[1] ?? 1,
      ]
    },
  })
  const rangeMax = computed({
    get: () => polyhedron_attribute_range.value?.[1] ?? 1,
    set: (val) => {
      polyhedron_attribute_range.value = [
        polyhedron_attribute_range.value?.[0] ?? 0,
        val,
      ]
    },
  })

  onMounted(() => {
    getPolyhedronAttributes()
  })

  function getPolyhedronAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.polyhedron_attribute_names,
      { id: props.id },
      {
        response_function: (response) => {
          polyhedron_attributes.value = response.attributes
        },
      },
    )
  }

  const currentAttribute = computed(() => {
    return polyhedron_attributes.value.find(
      (attr) => attr.attribute_name === polyhedron_attribute_name.value,
    )
  })

  watch(polyhedron_attribute_name, (newName) => {
    if (newName) {
      const attr = polyhedron_attributes.value.find(
        (a) => a.attribute_name === newName,
      )
      if (
        attr &&
        attr.min_value !== undefined &&
        attr.max_value !== undefined
      ) {
        const currentRange = polyhedron_attribute_range.value
        const hasNoSavedPreset =
          !currentRange || (currentRange[0] === 0 && currentRange[1] === 1)
        if (hasNoSavedPreset) {
          if (!polyhedron_attribute_color_map.value) {
            polyhedron_attribute_color_map.value = "Cool to Warm"
          }
          polyhedron_attribute_range.value = [attr.min_value, attr.max_value]
        }
      }
    }
  })
</script>

<template>
  <v-select
    v-model="polyhedron_attribute_name"
    :items="polyhedron_attributes.map((attribute) => attribute.attribute_name)"
    item-title="attribute_name"
    item-value="attribute_name"
    label="Select an attribute"
    density="compact"
  />
  <ViewerOptionsAttributeColorBar
    v-if="polyhedron_attribute_name && polyhedron_attribute_range"
    v-model:minimum="rangeMin"
    v-model:maximum="rangeMax"
    v-model:colorMap="polyhedron_attribute_color_map"
    :autoMin="currentAttribute?.min_value"
    :autoMax="currentAttribute?.max_value"
  />
</template>
