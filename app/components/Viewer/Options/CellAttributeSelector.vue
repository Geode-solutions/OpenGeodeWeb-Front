<template>
  <div>
    <v-select
      v-model="cell_attribute_name"
      :items="cell_attribute_names"
      label="Select an attribute"
      density="compact"
    />
    <ViewerOptionsAttributeColorBar
      v-if="cell_attribute_name"
      v-model:min="cell_attribute.min"
      v-model:max="cell_attribute.max"
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

  const props = defineProps({
    id: { type: String, required: true },
  })

  const model = defineModel()
  const cell_attribute_name = ref("")
  const cell_attribute_names = ref([])
  const cell_attribute = reactive({
    name: cell_attribute_name.value,
    min: undefined,
    max: undefined,
  })
  const geodeStore = useGeodeStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  onMounted(() => {
    if (model.value != null) {
      cell_attribute_name.value = model.value.name
      cell_attribute.min = model.value.min
      cell_attribute.max = model.value.max
    }
  })

  watch(cell_attribute_name, (value) => {
    cell_attribute.name = value
    model.value = cell_attribute
  })

  watch(
    () => [cell_attribute.min, cell_attribute.max],
    () => {
      model.value = { ...cell_attribute }
    },
  )

  function onScalarRangeChange() {
    if (cell_attribute.min !== undefined && cell_attribute.max !== undefined) {
      dataStyleStore.setMeshCellsCellScalarRange(
        props.id,
        cell_attribute.min,
        cell_attribute.max,
      )
      hybridViewerStore.remoteRender()
    }
  }

  onMounted(() => {
    getCellAttributes()
  })

  function getCellAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.cell_attribute_names,
      {
        id: props.id,
      },
      {
        response_function: (response) => {
          cell_attribute_names.value = response.cell_attribute_names
        },
      },
    )
  }
</script>

