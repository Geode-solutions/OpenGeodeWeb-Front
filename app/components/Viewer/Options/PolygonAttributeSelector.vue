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

  const geodeStore = useGeodeStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  const selectedAttributeRange = computed(() => {
    const attribute = polygon_attribute_names.value.find(
      (attr) => attr.attribute_name === polygon_attribute_name.value,
    )
    if (attribute) {
      return [attribute.min_value, attribute.max_value]
    }
    return [0, 1]
  })

  const polygon_attribute = reactive({
    name: "",
    minimum: undefined,
    maximum: undefined,
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
      polygon_attribute.minimum !== undefined &&
      polygon_attribute.maximum !== undefined
    ) {
      dataStyleStore.setAttributeSettings(props.id, "polygon", oldName, {
        minimum: polygon_attribute.minimum,
        maximum: polygon_attribute.maximum,
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
      polygon_attribute.minimum = cached.minimum
      polygon_attribute.maximum = cached.maximum
      polygon_attribute.colorMap = cached.colorMap
    } else {
      const attribute = polygon_attribute_names.value.find(
        (attr) => attr.attribute_name === attributeName,
      )
      polygon_attribute.minimum = attribute ? attribute.min_value : 0
      polygon_attribute.maximum = attribute ? attribute.max_value : 1
      polygon_attribute.colorMap = "Cool to Warm"
    }
    nextTick(() => {
      onScalarRangeChange()
      onColorMapChange()
    })
  }

  watch(
    () => [
      polygon_attribute.minimum,
      polygon_attribute.maximum,
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
            minimum: polygon_attribute.minimum,
            maximum: polygon_attribute.maximum,
            colorMap: polygon_attribute.colorMap,
          },
        )
      }
    },
  )

  function onScalarRangeChange() {
    if (
      polygon_attribute.minimum !== undefined &&
      polygon_attribute.maximum !== undefined
    ) {
      dataStyleStore.setMeshPolygonsPolygonAttributeRange(
        props.id,
        polygon_attribute.minimum,
        polygon_attribute.maximum,
      )
      onColorMapChange()
    }
  }

  function onColorMapChange() {
    if (
      polygon_attribute.minimum !== undefined &&
      polygon_attribute.maximum !== undefined &&
      polygon_attribute.colorMap
    ) {
      dataStyleStore.setMeshPolygonsPolygonAttributeColorMap(
        props.id,
        polygon_attribute.colorMap,
        polygon_attribute.minimum,
        polygon_attribute.maximum,
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
          polygon_attribute_names.value = response.attributes
        },
      },
    )
  }
</script>

<template>
  <v-select
    v-model="polygon_attribute_name"
    :items="polygon_attribute_names"
    item-title="attribute_name"
    item-value="attribute_name"
    label="Select an attribute"
    density="compact"
  />
  <ViewerOptionsAttributeColorBar
    v-if="polygon_attribute_name"
    v-model:minimum="polygon_attribute.minimum"
    v-model:maximum="polygon_attribute.maximum"
    v-model:colorMap="polygon_attribute.colorMap"
    :auto-min="selectedAttributeRange[0]"
    :auto-max="selectedAttributeRange[1]"
    @update:minimum="onScalarRangeChange"
    @update:maximum="onScalarRangeChange"
    @update:colorMap="onColorMapChange"
  />
</template>
