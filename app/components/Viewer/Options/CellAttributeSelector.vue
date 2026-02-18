<script setup>
  import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar"
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"
  import { useDataStyleStore } from "@ogw_front/stores/data_style"
  import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar"

  const geodeStore = useGeodeStore()
  const dataStyleStore = useDataStyleStore()

  const cell_attribute_name = defineModel("cell_attribute_name", {
    type: String,
  })
  const cell_attribute_range = defineModel("cell_attribute_range", {
    type: Array,
  })
  const cell_attribute_color_map = defineModel("cell_attribute_color_map", {
    type: String,
  })
  const cell_attributes = ref([])

  const { id } = defineProps({
    id: { type: String, required: true },
    storePrefix: { type: String, default: "meshCellsCell" },
  })

  const rangeMin = computed({
    get: () => cell_attribute_range.value[0],
    set: (val) => {
      cell_attribute_range.value = [val, cell_attribute_range.value[1]]
    },
  })
  const rangeMax = computed({
    get: () => cell_attribute_range.value[1],
    set: (val) => {
      cell_attribute_range.value = [cell_attribute_range.value[0], val]
    },
  })

  onMounted(() => {
    getCellAttributes()
  })

  function getCellAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.cell_attribute_names,
      {
        id,
      },
      {
        response_function: (response) =>
          (cell_attributes.value = response.attributes),
      },
    )
  }

  const currentAttribute = computed(() =>
    cell_attributes.value.find(
      (attr) => attr.attribute_name === cell_attribute_name.value,
    ),
  )

  function resetRange() {
    if (currentAttribute.value) {
      cell_attribute_range.value = [
        currentAttribute.value.min_value,
        currentAttribute.value.max_value,
      ]
    }
  }

  watch(currentAttribute, (newVal) => {
    if (newVal) {
      const storedConfig = dataStyleStore[
        `${props.storePrefix}AttributeStoredConfig`
      ](props.id, newVal.attribute_name)
      if (!storedConfig.isAutoSet) {
        resetRange()
      }
    }
  })
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
