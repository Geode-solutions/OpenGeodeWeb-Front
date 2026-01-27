<template>
  <div>
    <v-select
      v-model="polyhedron_attribute_name"
      :items="polyhedron_attribute_names"
      label="Select an attribute"
      density="compact"
    />
    <ViewerOptionsAttributeColorBar
      v-if="polyhedron_attribute_name"
      v-model:min="polyhedron_attribute.min"
      v-model:max="polyhedron_attribute.max"
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

  const model = defineModel()
  const geodeStore = useGeodeStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const polyhedron_attribute_name = ref("")

  const polyhedron_attribute = reactive({
    name: polyhedron_attribute_name.value,
    min: undefined,
    max: undefined,
  })

  onMounted(() => {
    if (model.value != null) {
      polyhedron_attribute_name.value = model.value.name
      polyhedron_attribute.min = model.value.min
      polyhedron_attribute.max = model.value.max
    }
  })

  watch(polyhedron_attribute_name, (value) => {
    polyhedron_attribute.name = value
    model.value = polyhedron_attribute
  })

  watch(
    () => [polyhedron_attribute.min, polyhedron_attribute.max],
    () => {
      model.value = { ...polyhedron_attribute }
    },
  )

  function onScalarRangeChange() {
    if (
      polyhedron_attribute.min !== undefined &&
      polyhedron_attribute.max !== undefined
    ) {
      dataStyleStore.setPolyhedraPolyhedronScalarRange(
        props.id,
        polyhedron_attribute.min,
        polyhedron_attribute.max,
      )
      hybridViewerStore.remoteRender()
    }
  }

  const props = defineProps({
    id: { type: String, required: true },
  })

  const polyhedron_attribute_names = ref([])

  onMounted(() => {
    getPolyhedronAttributes()
  })

  function getPolyhedronAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.polyhedron_attribute_names,
      { id: props.id },
      {
        response_function: (response) => {
          polyhedron_attribute_names.value = response.polyhedron_attribute_names
        },
      },
    )
  }
</script>

