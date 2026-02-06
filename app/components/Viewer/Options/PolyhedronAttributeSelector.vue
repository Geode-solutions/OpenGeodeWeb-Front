<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"

  const model = defineModel()

  const polyhedron_attribute_name = ref("")

  onMounted(() => {
    if (model.value !== null) {
      polyhedron_attribute_name.value = model.value.name
    }
  })
  const polyhedron_attribute = reactive({
    name: polyhedron_attribute_name.value,
  })

  watch(polyhedron_attribute_name, (value) => {
    polyhedron_attribute.name = value
    model.value = polyhedron_attribute
  })

  const { id } = defineProps({
    id: { type: String, required: true },
  })

  const polyhedron_attribute_names = ref([])
  const geodeStore = useGeodeStore()

  onMounted(() => {
    getVertexAttributes()
  })

  function getVertexAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.polyhedron_attribute_names,
      { id: id },
      {
        response_function: (response) => {
          polyhedron_attribute_names.value = response.polyhedron_attribute_names
        },
      },
    )
  }
</script>

<template>
  <v-select
    v-model="polyhedron_attribute_name"
    :items="polyhedron_attribute_names"
    label="Select an attribute"
    density="compact"
  />
</template>
