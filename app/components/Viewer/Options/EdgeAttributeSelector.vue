<template>
  <v-row justify="center" align="center">
    <v-col cols="auto">
      <v-icon
        size="30"
        icon="mdi-ray-end-arrow"
        v-tooltip:left="'Edge Attribute'"
      />
    </v-col>
    <v-col>
      <v-select
        v-model="edge_attribute_name"
        :items="edge_attribute_names"
        label="Select an edge attribute"
        density="compact"
        hide-details
      />
    </v-col>
  </v-row>
</template>

<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"

  const geodeStore = useGeodeStore()

  const model = defineModel()

  const props = defineProps({
    id: { type: String, required: true },
  })

  const edge_attribute_name = ref("")
  const edge_attribute_names = ref([])

  onMounted(() => {
    if (model.value != null) {
      edge_attribute_name.value = model.value.name
    }
  })

  const edge_attribute = reactive({ name: edge_attribute_name.value })

  watch(edge_attribute_name, (value) => {
    edge_attribute.name = value
    model.value = edge_attribute
  })

  function get_edge_attribute_names() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.edge_attribute_names,
      { id: props.id },
      {
        response_function: (response) => {
          edge_attribute_names.value = response.edge_attribute_names
        },
      },
    )
  }

  onMounted(() => {
    get_edge_attribute_names()
  })

  watch(
    () => props.id,
    () => {
      get_edge_attribute_names()
    },
  )
</script>
