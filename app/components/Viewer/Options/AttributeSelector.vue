<script setup>
  import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar.vue"
  import { useGeodeStore } from "@ogw_front/stores/geode"

  const geodeStore = useGeodeStore()

  const name = defineModel("name", { type: String })
  const range = defineModel("range", { type: Array })
  const colorMap = defineModel("colorMap", { type: String })

  const props = defineProps({
    label: { type: String, required: true },
    id: { type: String, required: true },
    schema: { type: Object, required: true },
  })

  const attributes = ref([])

  const rangeMin = computed({
    get: () => range.value[0],
    set: (val) => {
      range.value = [val, range.value[1]]
    },
  })
  const rangeMax = computed({
    get: () => range.value[1],
    set: (val) => {
      range.value = [range.value[0], val]
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
      props.schema,
      { id: props.id },
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
    () => [props.id, props.schema],
    () => {
      getAttributes()
    },
  )
</script>

<template>
  <v-select
    v-model="name"
    :items="attributes.map((attribute) => attribute.attribute_name)"
    item-title="attribute_name"
    item-value="attribute_name"
    :label="props.label"
    density="compact"
  />
  <ViewerOptionsAttributeColorBar
    v-if="name"
    v-model:minimum="rangeMin"
    v-model:maximum="rangeMax"
    v-model:colorMap="colorMap"
    @reset="resetRange"
  />
</template>
