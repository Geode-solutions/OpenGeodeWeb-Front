<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"

  const { id } = defineProps({
    id: { type: String, required: true },
  })

  const model = defineModel()
  const cell_attribute_name = ref("")
  const cell_attribute_names = ref([])
  const cell_attribute = reactive({ name: cell_attribute_name.value })
  const geodeStore = useGeodeStore()

  onMounted(() => {
    if (model.value !== null) {
      cell_attribute_name.value = model.value.name
    }
  })

  watch(cell_attribute_name, (value) => {
    cell_attribute.name = value
    model.value = cell_attribute
  })

  onMounted(() => {
    getCellAttributes()
  })

  function getCellAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.cell_attribute_names,
      {
        id: id,
      },
      {
        response_function: (response) => {
          cell_attribute_names.value = response.cell_attribute_names
        },
      },
    )
  }
</script>

<template>
  <v-select
    v-model="cell_attribute_name"
    :items="cell_attribute_names"
    label="Select an attribute"
    density="compact"
  />
</template>
