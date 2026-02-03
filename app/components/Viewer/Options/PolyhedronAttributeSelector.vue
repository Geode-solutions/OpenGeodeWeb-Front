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
  const geodeStore = useGeodeStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const polyhedron_attribute_name = ref("")
  const polyhedron_attribute_names = ref([])

  const selectedAttributeRange = computed(() => {
    const attribute = polyhedron_attribute_names.value.find(
      (attr) => attr.attribute_name === polyhedron_attribute_name.value,
    )
    if (attribute) {
      return [attribute.min_value, attribute.max_value]
    }
    return [0, 1]
  })

  const polyhedron_attribute = reactive({
    name: "",
    min: undefined,
    max: undefined,
    colorMap: "Cool to Warm",
  })

  onMounted(() => {
    if (model.value != null && model.value.name) {
      polyhedron_attribute_name.value = model.value.name
      loadSettingsForAttribute(model.value.name)
    }
  })

  watch(polyhedron_attribute_name, (newName, oldName) => {
    if (
      oldName &&
      polyhedron_attribute.min !== undefined &&
      polyhedron_attribute.max !== undefined
    ) {
      dataStyleStore.setAttributeSettings(props.id, "polyhedron", oldName, {
        min: polyhedron_attribute.min,
        max: polyhedron_attribute.max,
        colorMap: polyhedron_attribute.colorMap,
      })
    }
    polyhedron_attribute.name = newName
    if (newName) {
      loadSettingsForAttribute(newName)
    }
    model.value = { ...polyhedron_attribute }
  })

  function loadSettingsForAttribute(attributeName) {
    const cached = dataStyleStore.getAttributeSettings(
      props.id,
      "polyhedron",
      attributeName,
    )
    if (cached) {
      polyhedron_attribute.min = cached.min
      polyhedron_attribute.max = cached.max
      polyhedron_attribute.colorMap = cached.colorMap
    } else {
      const attribute = polyhedron_attribute_names.value.find(
        (attr) => attr.attribute_name === attributeName,
      )
      polyhedron_attribute.min = attribute ? attribute.min_value : 0
      polyhedron_attribute.max = attribute ? attribute.max_value : 1
      polyhedron_attribute.colorMap = "Cool to Warm"
    }
    // Apply the loaded settings to the viewer
    nextTick(() => {
      onScalarRangeChange()
      onColorMapChange()
    })
  }

  watch(
    () => [
      polyhedron_attribute.min,
      polyhedron_attribute.max,
      polyhedron_attribute.colorMap,
    ],
    () => {
      model.value = { ...polyhedron_attribute }
      if (polyhedron_attribute.name) {
        dataStyleStore.setAttributeSettings(
          props.id,
          "polyhedron",
          polyhedron_attribute.name,
          {
            min: polyhedron_attribute.min,
            max: polyhedron_attribute.max,
            colorMap: polyhedron_attribute.colorMap,
          },
        )
      }
    },
  )

  function onScalarRangeChange() {
    if (
      polyhedron_attribute.min !== undefined &&
      polyhedron_attribute.max !== undefined
    ) {
      dataStyleStore.setMeshPolyhedraPolyhedronScalarRange(
        props.id,
        polyhedron_attribute.min,
        polyhedron_attribute.max,
      )
      onColorMapChange()
    }
  }

  function onColorMapChange() {
    if (
      polyhedron_attribute.min !== undefined &&
      polyhedron_attribute.max !== undefined &&
      polyhedron_attribute.colorMap
    ) {
      dataStyleStore.setMeshPolyhedraPolyhedronColorMap(
        props.id,
        polyhedron_attribute.colorMap,
        polyhedron_attribute.min,
        polyhedron_attribute.max,
      )
      hybridViewerStore.remoteRender()
    }
  }

  onMounted(() => {
    getPolyhedronAttributes()
  })

  function getPolyhedronAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.polyhedron_attribute_names,
      { id: props.id },
      {
        response_function: (response) => {
          polyhedron_attribute_names.value = response.attributes
        },
      },
    )
  }
</script>

<template>
  <v-select
    v-model="polyhedron_attribute_name"
    :items="polyhedron_attribute_names"
    item-title="attribute_name"
    item-value="attribute_name"
    label="Select an attribute"
    density="compact"
  />
  <ViewerOptionsAttributeColorBar
    v-if="polyhedron_attribute_name"
    v-model:min="polyhedron_attribute.min"
    v-model:max="polyhedron_attribute.max"
    v-model:colorMap="polyhedron_attribute.colorMap"
    :auto-min="selectedAttributeRange[0]"
    :auto-max="selectedAttributeRange[1]"
    @update:min="onScalarRangeChange"
    @update:max="onScalarRangeChange"
    @update:colorMap="onColorMapChange"
  />
</template>
