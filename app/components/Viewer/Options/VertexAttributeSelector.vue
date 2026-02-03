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
    meshType: { type: String, default: "polygons" },
  })

  const vertex_attribute_name = ref("")
  const vertex_attribute_names = ref([])

  const selectedAttributeRange = computed(() => {
    const attribute = vertex_attribute_names.value.find(
      (attr) => attr.attribute_name === vertex_attribute_name.value,
    )
    if (attribute) {
      return [attribute.min_value, attribute.max_value]
    }
    return [0, 1]
  })

  const vertex_attribute = reactive({
    name: "",
    minimum: undefined,
    maximum: undefined,
    colorMap: "Cool to Warm",
  })

  onMounted(() => {
    if (model.value != null && model.value.name) {
      vertex_attribute_name.value = model.value.name
      loadSettingsForAttribute(model.value.name)
    }
  })

  watch(vertex_attribute_name, (newName, oldName) => {
    if (
      oldName &&
      vertex_attribute.minimum !== undefined &&
      vertex_attribute.maximum !== undefined
    ) {
      dataStyleStore.setAttributeSettings(props.id, "vertex", oldName, {
        minimum: vertex_attribute.minimum,
        maximum: vertex_attribute.maximum,
        colorMap: vertex_attribute.colorMap,
      })
    }

    vertex_attribute.name = newName

    if (newName) {
      loadSettingsForAttribute(newName)
    }

    model.value = { ...vertex_attribute }
  })

  function loadSettingsForAttribute(attributeName) {
    const cached = dataStyleStore.getAttributeSettings(
      props.id,
      "vertex",
      attributeName,
    )
    if (cached) {
      vertex_attribute.minimum = cached.minimum
      vertex_attribute.maximum = cached.maximum
      vertex_attribute.colorMap = cached.colorMap
    } else {
      const attribute = vertex_attribute_names.value.find(
        (attr) => attr.attribute_name === attributeName,
      )
      vertex_attribute.minimum = attribute ? attribute.min_value : 0
      vertex_attribute.maximum = attribute ? attribute.max_value : 1
      vertex_attribute.colorMap = "Cool to Warm"
    }
    nextTick(() => {
      onScalarRangeChange()
      onColorMapChange()
    })
  }

  watch(
    () => [
      vertex_attribute.minimum,
      vertex_attribute.maximum,
      vertex_attribute.colorMap,
    ],
    () => {
      model.value = { ...vertex_attribute }
      if (vertex_attribute.name) {
        dataStyleStore.setAttributeSettings(
          props.id,
          "vertex",
          vertex_attribute.name,
          {
            minimum: vertex_attribute.minimum,
            maximum: vertex_attribute.maximum,
            colorMap: vertex_attribute.colorMap,
          },
        )
      }
    },
  )

  function onScalarRangeChange() {
    if (
      vertex_attribute.minimum !== undefined &&
      vertex_attribute.maximum !== undefined
    ) {
      const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)
      const methodName = `setMesh${capitalize(props.meshType)}VertexAttributeRange`
      dataStyleStore[methodName](
        props.id,
        vertex_attribute.minimum,
        vertex_attribute.maximum,
      )
      onColorMapChange()
    }
  }

  function onColorMapChange() {
    if (
      vertex_attribute.minimum !== undefined &&
      vertex_attribute.maximum !== undefined &&
      vertex_attribute.colorMap
    ) {
      const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1)
      const methodName = `setMesh${capitalize(
        props.meshType,
      )}VertexAttributeColorMap`
      dataStyleStore[methodName](
        props.id,
        vertex_attribute.colorMap,
        vertex_attribute.minimum,
        vertex_attribute.maximum,
      )
      hybridViewerStore.remoteRender()
    }
  }

  onMounted(() => {
    getVertexAttributes()
  })

  function getVertexAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.vertex_attribute_names,
      { id: props.id },
      {
        response_function: (response) => {
          vertex_attribute_names.value = response.attributes
        },
      },
    )
  }
</script>

<template>
  <v-select
    v-model="vertex_attribute_name"
    :items="vertex_attribute_names"
    item-title="attribute_name"
    item-value="attribute_name"
    label="Select an attribute"
    density="compact"
  />
  <ViewerOptionsAttributeColorBar
    v-if="vertex_attribute_name"
    v-model:minimum="vertex_attribute.minimum"
    v-model:maximum="vertex_attribute.maximum"
    v-model:colorMap="vertex_attribute.colorMap"
    :auto-min="selectedAttributeRange[0]"
    :auto-max="selectedAttributeRange[1]"
    @update:minimum="onScalarRangeChange"
    @update:maximum="onScalarRangeChange"
    @update:colorMap="onColorMapChange"
  />
</template>
