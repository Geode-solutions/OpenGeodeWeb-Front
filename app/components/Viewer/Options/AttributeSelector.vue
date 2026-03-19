<script setup>
  import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar.vue"
  import { useGeodeStore } from "@ogw_front/stores/geode"

  const geodeStore = useGeodeStore()

  const name = defineModel("name", { type: String })
  const range = defineModel("range", { type: Array })
  const colorMap = defineModel("colorMap", { type: String })

  const { id, schema } = defineProps({
    id: { type: String, required: true },
    schema: { type: Object, required: true },
  })

  const attributes = ref([])

  const rangeMin = computed({
    get: () => (range.value ? range.value[0] : undefined),
    set: (val) => {
      const currentMax = range.value ? range.value[1] : undefined
      let newMin = val
      if (currentMax !== undefined && val > currentMax) {
        newMin = currentMax
      }
      range.value = [newMin, currentMax]
    },
  })
  const rangeMax = computed({
    get: () => (range.value ? range.value[1] : undefined),
    set: (val) => {
      const currentMin = range.value ? range.value[0] : undefined
      let newMax = val
      if (currentMin !== undefined && val < currentMin) {
        newMax = currentMin
      }
      range.value = [currentMin, newMax]
    },
  })

  const currentAttribute = computed(() =>
    attributes.value.find((attr) => attr.attribute_name === name.value),
  )

  function resetRange() {
    if (currentAttribute.value) {
      range.value = [
        currentAttribute.value.min_value,
        currentAttribute.value.max_value,
      ]
    }
  }

  function getAttributes() {
    geodeStore.request(
      schema,
      { id },
      {
        response_function: (response) => {
          attributes.value = response.attributes
        },
      },
    )
  }

  onMounted(() => {
    getAttributes()
  })

  watch(
    () => [id, schema],
    () => {
      getAttributes()
    },
  )

  watch(
    () => [name.value, attributes.value],
    () => {
      if (
        name.value &&
        attributes.value.length > 0 &&
        (range.value === undefined ||
          range.value[0] === undefined ||
          colorMap.value === undefined)
      ) {
        resetRange()
        if (colorMap.value === undefined) {
          colorMap.value = "Cool to Warm"
        }
      }
    },
  )
</script>

<template>
  <v-select
    v-model="name"
    :items="attributes.map((attribute) => attribute.attribute_name)"
    item-title="attribute_name"
    item-value="attribute_name"
    density="compact"
    label="Select an attribute"
  />
  <ViewerOptionsAttributeColorBar
    v-if="name"
    v-model:minimum="rangeMin"
    v-model:maximum="rangeMax"
    v-model:colorMap="colorMap"
    @reset="resetRange"
  />
</template>
