<template>
  <div>
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
  </div>
</template>

<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"
  import { useDataStyleStore } from "@ogw_front/stores/data_style"
  import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer"
  import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar"
  import { getRGBPointsFromPreset } from "@ogw_front/utils/colormap"

  const props = defineProps({
    id: { type: String, required: true },
  })

  const model = defineModel()
  const polygon_attribute_name = ref("")
  const polygon_attribute_names = ref([])
  const polygon_attribute_metadata = ref({})

  const selectedAttributeRange = computed(() => {
    if (polygon_attribute_name.value && polygon_attribute_metadata.value[polygon_attribute_name.value]) {
      return polygon_attribute_metadata.value[polygon_attribute_name.value]
    }
    return [0, 1]
  })

  const polygon_attribute = reactive({
    name: polygon_attribute_name.value,
    min: undefined,
    max: undefined,
    colorMap: "Cool to Warm",
  })
  const geodeStore = useGeodeStore()
  const dataStyleStore = useDataStyleStore()
  const hybridViewerStore = useHybridViewerStore()

  onMounted(() => {
    if (model.value != null) {
      polygon_attribute_name.value = model.value.name
      polygon_attribute.min = model.value.min
      polygon_attribute.max = model.value.max
      if (model.value.colorMap) {
        polygon_attribute.colorMap = model.value.colorMap
      }
    }
  })

  watch(polygon_attribute_name, (value) => {
    polygon_attribute.name = value
    model.value = polygon_attribute
  })

  watch(
    () => [polygon_attribute.min, polygon_attribute.max, polygon_attribute.colorMap],
    () => {
      model.value = { ...polygon_attribute }
    },
  )

  function onScalarRangeChange() {
    if (polygon_attribute.min !== undefined && polygon_attribute.max !== undefined) {
      dataStyleStore.setMeshPolygonsPolygonScalarRange(
        props.id,
        polygon_attribute.min,
        polygon_attribute.max,
      )
      hybridViewerStore.remoteRender()
    }
  }

  function onColorMapChange() {
    if (
      polygon_attribute.min !== undefined &&
      polygon_attribute.max !== undefined &&
      polygon_attribute.colorMap
    ) {
      const points = getRGBPointsFromPreset(
        polygon_attribute.colorMap,
        polygon_attribute.min,
        polygon_attribute.max,
      )
      dataStyleStore.setMeshPolygonsPolygonColorMap(props.id, points)
      hybridViewerStore.remoteRender()
    }
  }

  onMounted(() => {
    getPolygonAttributes()
  })

  function getPolygonAttributes() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.polygon_attribute_names,
      {
        id: props.id,
      },
      {
        response_function: (response) => {
          polygon_attribute_names.value = response.polygon_attribute_names
          polygon_attribute_metadata.value = response.polygon_attribute_metadata || {}
        },
      },
    )
  }
</script>
