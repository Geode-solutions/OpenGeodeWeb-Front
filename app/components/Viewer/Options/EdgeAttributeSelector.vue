<template>
  <div>
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
    <ViewerOptionsAttributeColorBar
      v-if="edge_attribute_name"
      v-model:min="edge_attribute.min"
      v-model:max="edge_attribute.max"
      @update:min="onScalarRangeChange"
      @update:max="onScalarRangeChange"
    />
  </div>
</template>

<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"
  import { useDataStyleStore } from "@ogw_front/stores/data_style"
  import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"
  import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar"

  const geodeStore = useGeodeStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const model = defineModel()

  const props = defineProps({
    id: { type: String, required: true },
  })

  const edge_attribute_name = ref("")
  const edge_attribute_names = ref([])

  const edge_attribute = reactive({
    name: edge_attribute_name.value,
    min: undefined,
    max: undefined,
  })

  onMounted(() => {
    if (model.value != null) {
      edge_attribute_name.value = model.value.name
      edge_attribute.min = model.value.min
      edge_attribute.max = model.value.max
    }
  })

  watch(edge_attribute_name, (value) => {
    edge_attribute.name = value
    model.value = edge_attribute
  })

  watch(
    () => [edge_attribute.min, edge_attribute.max],
    () => {
      model.value = { ...edge_attribute }
    },
  )

  function onScalarRangeChange() {
    if (edge_attribute.min !== undefined && edge_attribute.max !== undefined) {
      dataStyleStore.setMeshEdgesVertexScalarRange(
        props.id,
        edge_attribute.min,
        edge_attribute.max,
      )
      hybridViewerStore.remoteRender()
    }
  }

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

