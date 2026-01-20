<template>
  <v-select
    v-model="vertex_attribute_name"
    :items="vertex_attribute_names"
    label="Select an attribute"
    density="compact"
  />
</template>

<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"

  const geodeStore = useGeodeStore()

  const model = defineModel()

  const props = defineProps({
    id: { type: String, required: true },
  })

  const vertex_attribute_name = ref("")
  const vertex_attribute_names = ref([])

  onMounted(() => {
    if (model.value != null) {
      vertex_attribute_name.value = model.value.name
    }
  })
  const vertex_attribute = reactive({ name: vertex_attribute_name.value })

  watch(vertex_attribute_name, (value) => {
    vertex_attribute.name = value
    model.value = vertex_attribute
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
          vertex_attribute_names.value = response.vertex_attribute_names
        },
      },
    )
  }
</script>
