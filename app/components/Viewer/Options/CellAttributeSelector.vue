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

  const currentAttribute = computed(() => {
    return cell_attributes.value.find(
      (attr) => attr.attribute_name === cell_attribute_name.value,
    )
  })

  watch(cell_attribute_name, (newName) => {
    if (newName) {
      const attr = cell_attributes.value.find(
        (a) => a.attribute_name === newName,
      )
      if (
        attr &&
        attr.min_value !== undefined &&
        attr.max_value !== undefined
      ) {
        const currentRange = cell_attribute_range.value
        const hasNoSavedPreset =
          !currentRange || (currentRange[0] === 0 && currentRange[1] === 1)
        if (hasNoSavedPreset) {
          if (!cell_attribute_color_map.value) {
            cell_attribute_color_map.value = "Cool to Warm"
          }
          cell_attribute_range.value = [attr.min_value, attr.max_value]
        }
      }
    }
  })

  function resetRange() {
    if (currentAttribute.value) {
      cell_attribute_range.value = [
        currentAttribute.value.min_value,
        currentAttribute.value.max_value,
      ]
    }
  }
</script>

<template>
  <v-select
    v-model="cell_attribute_name"
    :items="cell_attributes.map((attribute) => attribute.attribute_name)"
    item-title="attribute_name"
    item-value="attribute_name"
    label="Select an attribute"
    density="compact"
  />
  <ViewerOptionsAttributeColorBar
    v-if="cell_attribute_name"
    v-model:minimum="rangeMin"
    v-model:maximum="rangeMax"
    v-model:colorMap="cell_attribute_color_map"
    @reset="resetRange"
  />
</template>
