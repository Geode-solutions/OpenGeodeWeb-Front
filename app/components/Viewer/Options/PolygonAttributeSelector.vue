<template>
  <v-select
    v-model="polygon_attribute_name"
    :items="polygon_attribute_names"
    label="Select an attribute"
    density="compact"
  />
</template>

<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

  const props = defineProps({
    id: { type: String, required: true },
  })

  const model = defineModel()
  const polygon_attribute_name = ref("")
  const polygon_attribute_names = ref([])
  const polygon_attribute = reactive({ name: polygon_attribute_name.value })
  const geodeStore = useGeodeStore()

  onMounted(() => {
    if (model.value != null) {
      polygon_attribute_name.value = model.value.name
    }
  })

  watch(polygon_attribute_name, (value) => {
    polygon_attribute.name = value
    model.value = polygon_attribute
  })

  onMounted(() => {
    getVertexAttributes()
  })

  function getVertexAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.polygon_attribute_names,
      { id: props.id },
      {
        response_function: (response) => {
          polygon_attribute_names.value = response._data.polygon_attribute_names
        },
      },
    )
  }
</script>
