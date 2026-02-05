<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"
  import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar"

  const geodeStore = useGeodeStore()

  const cell_attribute_name = defineModel("cell_attribute_name")
  const cell_attribute_range = defineModel("cell_attribute_range", {
    type: Array,
    default: () => [0, 1],
  })
  const cell_attribute_color_map = defineModel("cell_attribute_color_map")
  const cell_attributes = ref([])

  const selectedName = ref(cell_attribute_name.value)

  watch(cell_attribute_name, (newVal) => {
    selectedName.value = newVal
  })

  const props = defineProps({
    id: { type: String, required: true },
  })

  const rangeMin = computed({
    get: () => cell_attribute_range.value?.[0] ?? 0,
    set: (val) => {
      cell_attribute_range.value = [val, cell_attribute_range.value?.[1] ?? 1]
    },
  })
  const rangeMax = computed({
    get: () => cell_attribute_range.value?.[1] ?? 1,
    set: (val) => {
      cell_attribute_range.value = [cell_attribute_range.value?.[0] ?? 0, val]
    },
  })

  onMounted(() => {
    getCellAttributes()
  })

  function getCellAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.cell_attribute_names,
      { id: props.id },
      {
        response_function: (response) => {
          cell_attributes.value = response.attributes
        },
      },
    )
  }

  const emit = defineEmits(["attribute-selected"])

  watch(selectedName, (newName) => {
    if (!newName) return
    const attribute = cell_attributes.value.find(
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
</script>

<template>
  <v-select
    v-model="selectedName"
    :items="cell_attributes.map((attribute) => attribute.attribute_name)"
    item-title="attribute_name"
    item-value="attribute_name"
    label="Select an attribute"
    density="compact"
  />
  <ViewerOptionsAttributeColorBar
    v-if="cell_attribute_name && cell_attribute_range"
    v-model:minimum="rangeMin"
    v-model:maximum="rangeMax"
    v-model:colorMap="cell_attribute_color_map"
  />
</template>
