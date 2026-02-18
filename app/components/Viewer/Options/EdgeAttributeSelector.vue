<script setup>
  import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar.vue"
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"
  import { useDataStyleStore } from "@ogw_front/stores/data_style"

  const geodeStore = useGeodeStore()
  const dataStyleStore = useDataStyleStore()

  const edge_attribute_name = defineModel("edge_attribute_name", {
    type: String,
  })
  const edge_attribute_range = defineModel("edge_attribute_range", {
    type: Array,
  })
  const edge_attribute_color_map = defineModel("edge_attribute_color_map", {
    type: String,
  })
  const edge_attributes = ref([])

  const props = defineProps({
    id: { type: String, required: true },
    storePrefix: { type: String, default: "meshEdgesEdge" },
  })

  const rangeMin = computed({
    get: () => edge_attribute_range.value[0],
    set: (val) => {
      edge_attribute_range.value = [val, edge_attribute_range.value[1]]
    },
  })
  const rangeMax = computed({
    get: () => edge_attribute_range.value[1],
    set: (val) => {
      edge_attribute_range.value = [edge_attribute_range.value[0], val]
    },
  })

  onMounted(() => {
    getEdgeAttributes()
  })

  function getEdgeAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.edge_attribute_names,
      { id: props.id },
      {
        response_function: (response) => {
          edge_attributes.value = response.attributes
        },
      },
    )
  }

  const currentAttribute = computed(() =>
    edge_attributes.value.find(
      (attr) => attr.attribute_name === edge_attribute_name.value,
    ),
  )

  function resetRange() {
    if (currentAttribute.value) {
      edge_attribute_range.value = [
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
    v-model="edge_attribute_name"
    :items="edge_attributes.map((attribute) => attribute.attribute_name)"
    item-title="attribute_name"
    item-value="attribute_name"
    label="Select an attribute"
    density="compact"
  />
  <ViewerOptionsAttributeColorBar
    v-if="edge_attribute_name"
    v-model:minimum="rangeMin"
    v-model:maximum="rangeMax"
    v-model:colorMap="edge_attribute_color_map"
    @reset="resetRange"
  />
</template>
