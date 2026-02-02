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
  const polygon_attribute_name = ref("")
  const polygon_attribute_names = ref([])
  const polygon_attribute_metadata = ref({})

  const geodeStore = useGeodeStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const selectedAttributeRange = computed(() => {
    if (
      polygon_attribute_name.value &&
      polygon_attribute_metadata.value[polygon_attribute_name.value]
    ) {
      return polygon_attribute_metadata.value[polygon_attribute_name.value]
    }
    return [0, 1]
  })

  const polygon_attribute = reactive({
    name: "",
    min: undefined,
    max: undefined,
    colorMap: "Cool to Warm",
  })

  onMounted(() => {
    if (model.value != null && model.value.name) {
      polygon_attribute_name.value = model.value.name
      loadSettingsForAttribute(model.value.name)
    }
  })

  watch(polygon_attribute_name, (newName, oldName) => {
    if (
      oldName &&
      polygon_attribute.min !== undefined &&
      polygon_attribute.max !== undefined
    ) {
      dataStyleStore.setAttributeSettings(props.id, "polygon", oldName, {
        min: polygon_attribute.min,
        max: polygon_attribute.max,
        colorMap: polygon_attribute.colorMap,
      })
    }

    polygon_attribute.name = newName

    if (newName) {
      loadSettingsForAttribute(newName)
    }

    model.value = { ...polygon_attribute }
  })

  function loadSettingsForAttribute(attributeName) {
    const cached = dataStyleStore.getAttributeSettings(
      props.id,
      "polygon",
      attributeName,
    )
    if (cached) {
      polygon_attribute.min = cached.min
      polygon_attribute.max = cached.max
      polygon_attribute.colorMap = cached.colorMap
    } else {
      const range = polygon_attribute_metadata.value[attributeName]
      polygon_attribute.min = range ? range[0] : 0
      polygon_attribute.max = range ? range[1] : 1
      polygon_attribute.colorMap = "Cool to Warm"
    }
    nextTick(() => {
      onScalarRangeChange()
      onColorMapChange()
    })
  }

  watch(
    () => [
      polygon_attribute.min,
      polygon_attribute.max,
      polygon_attribute.colorMap,
    ],
    () => {
      model.value = { ...polygon_attribute }
      if (polygon_attribute.name) {
        dataStyleStore.setAttributeSettings(
          props.id,
          "polygon",
          polygon_attribute.name,
          {
            min: polygon_attribute.min,
            max: polygon_attribute.max,
            colorMap: polygon_attribute.colorMap,
          },
        )
      }
    },
  )

  function onScalarRangeChange() {
    if (
      polygon_attribute.min !== undefined &&
      polygon_attribute.max !== undefined
    ) {
      dataStyleStore.setMeshPolygonsPolygonScalarRange(
        props.id,
        polygon_attribute.min,
        polygon_attribute.max,
      )
      onColorMapChange()
    }
  }

  function onColorMapChange() {
    if (
      polygon_attribute.min !== undefined &&
      polygon_attribute.max !== undefined &&
      polygon_attribute.colorMap
    ) {
      dataStyleStore.setMeshPolygonsPolygonColorMap(
        props.id,
        polygon_attribute.colorMap,
        polygon_attribute.min,
        polygon_attribute.max,
      )
      hybridViewerStore.remoteRender()
    }
  }

  onMounted(() => {
    getPolygonAttributes()
  })

  function getPolygonAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.polygon_attribute_names,
      { id: props.id },
      {
        response_function: (response) => {
          const names = []
          const metadata = {}
          for (const attribute of response.attributes) {
            names.push(attribute.attribute_name)
            metadata[attribute.attribute_name] = [
              attribute.min_value,
              attribute.max_value,
            ]
          }
          polygon_attribute_names.value = names
          polygon_attribute_metadata.value = metadata
        },
      },
    )
  }
</script>

<template>
  <v-select
    v-model="polygon_attribute_name"
    :items="polygon_attribute_names"
    label="Select an attribute"
    density="compact"
  />
  <ViewerOptionsAttributeColorBar
    v-if="polygon_attribute_name"
    v-model:min="polygon_attribute.min"
    v-model:max="polygon_attribute.max"
    v-model:colorMap="polygon_attribute.colorMap"
    :auto-min="selectedAttributeRange[0]"
    :auto-max="selectedAttributeRange[1]"
    @update:min="onScalarRangeChange"
    @update:max="onScalarRangeChange"
    @update:colorMap="onColorMapChange"
  />
</template>
