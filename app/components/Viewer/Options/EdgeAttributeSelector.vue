<template>
  <v-row justify="center" align="center">
    <v-col cols="auto">
      <v-icon size="30" icon="mdi-ray-end-arrow" v-tooltip:left="'Edge Attribute'" />
    </v-col>
    <v-col>
      <v-select
        v-model="edge_attribute"
        :items="edge_attribute_names"
        label="Select an edge attribute"
        density="compact"
        hide-details
      />
    </v-col>
  </v-row>
</template>

<script setup>
  import { useGeodeStore } from "@ogw_front/stores/geode"

  const geodeStore = useGeodeStore()

  const edge_attribute = defineModel()

  const props = defineProps({
    id: { type: String, required: true },
  })

  const edge_attribute_names = ref([])

  async function get_edge_attribute_names() {
    const response = await geodeStore.get_edge_attribute_names(props.id)
    edge_attribute_names.value = response
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
