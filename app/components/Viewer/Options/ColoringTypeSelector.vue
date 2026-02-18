<script setup>
  import ViewerOptionsCellAttributeSelector from "@ogw_front/components/Viewer/Options/CellAttributeSelector.vue"
  import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue"
  import ViewerOptionsEdgeAttributeSelector from "@ogw_front/components/Viewer/Options/EdgeAttributeSelector.vue"
  import ViewerOptionsPolygonAttributeSelector from "@ogw_front/components/Viewer/Options/PolygonAttributeSelector.vue"
  import ViewerOptionsPolyhedronAttributeSelector from "@ogw_front/components/Viewer/Options/PolyhedronAttributeSelector.vue"
  import ViewerOptionsTexturesSelector from "@ogw_front/components/Viewer/Options/TexturesSelector.vue"
  import ViewerOptionsVertexAttributeSelector from "@ogw_front/components/Viewer/Options/VertexAttributeSelector.vue"

  const coloring_style_key = defineModel("coloring_style_key")

  const color = defineModel("color")
  const textures = defineModel("textures")

  const vertex_attribute_name = defineModel("vertex_attribute_name")
  const vertex_attribute_range = defineModel("vertex_attribute_range")
  const vertex_attribute_color_map = defineModel("vertex_attribute_color_map")

  const edge_attribute_name = defineModel("edge_attribute_name")
  const edge_attribute_range = defineModel("edge_attribute_range")
  const edge_attribute_color_map = defineModel("edge_attribute_color_map")

  const cell_attribute_name = defineModel("cell_attribute_name")
  const cell_attribute_range = defineModel("cell_attribute_range")
  const cell_attribute_color_map = defineModel("cell_attribute_color_map")

  const polygon_attribute_name = defineModel("polygon_attribute_name")
  const polygon_attribute_range = defineModel("polygon_attribute_range")
  const polygon_attribute_color_map = defineModel("polygon_attribute_color_map")

  const polyhedron_attribute_name = defineModel("polyhedron_attribute_name")
  const polyhedron_attribute_range = defineModel("polyhedron_attribute_range")
  const polyhedron_attribute_color_map = defineModel(
    "polyhedron_attribute_color_map",
  )

  const { id } = defineProps({
    id: { type: String, required: true },
    vertexStorePrefix: { type: String, default: "" },
    edgeStorePrefix: { type: String, default: "" },
    cellStorePrefix: { type: String, default: "" },
    polygonStorePrefix: { type: String, default: "" },
    polyhedronStorePrefix: { type: String, default: "" },
  })

  const has_color = computed(() => color.value !== undefined)
  const has_textures = computed(() => textures.value !== undefined)
  const has_vertex = computed(() => vertex_attribute_range.value !== undefined)
  const has_edge = computed(() => edge_attribute_range.value !== undefined)
  const has_cells = computed(() => cell_attribute_range.value !== undefined)
  const has_polygons = computed(
    () => polygon_attribute_range.value !== undefined,
  )
  const has_polyhedra = computed(
    () => polyhedron_attribute_range.value !== undefined,
  )

  const color_dict = { name: "Color", value: "color" }
  const textures_dict = { name: "Textures", value: "textures" }
  const vertex_dict = { name: "Vertex attribute", value: "vertex" }
  const edge_dict = { name: "Edge attribute", value: "edge" }
  const cell_dict = { name: "Cell attribute", value: "cell" }
  const polygon_dict = { name: "Polygon attribute", value: "polygon" }
  const polyhedron_dict = {
    name: "Polyhedron attribute",
    value: "polyhedron",
  }
  const coloring_styles = computed(() => {
    let array = []
    if (has_color.value) {
      array.push(color_dict)
    }
    if (has_textures.value) {
      array.push(textures_dict)
    }
    if (has_vertex.value) {
      array.push(vertex_dict)
    }
    if (has_edge.value) {
      array.push(edge_dict)
    }
    if (has_cells.value) {
      array.push(cell_dict)
    }
    if (has_polygons.value) {
      array.push(polygon_dict)
    }
    if (has_polyhedra.value) {
      array.push(polyhedron_dict)
    }

    const labels = array.map((coloring) => coloring.name)
    const values = array.map((coloring) => coloring.value)

    return { labels, values }
  })

  const coloring_style_label = ref(
    coloring_styles.value.labels[
      coloring_styles.value.values.indexOf(coloring_style_key.value)
    ],
  )

  watch(coloring_style_label, (value) => {
    coloring_style_key.value =
      coloring_styles.value.values[coloring_styles.value.labels.indexOf(value)]
  })
</script>
<template>
  <v-row justify="center" align="center">
    <v-divider />
    <v-col>
      <v-row justify="center" align="center">
        <v-col cols="auto">
          <v-icon
            size="30"
            icon="mdi-format-color-fill"
            v-tooltip:left="'Coloring'"
          />
        </v-col>
        <v-col>
          <v-select
            v-model="coloring_style_label"
            :items="coloring_styles.labels"
            label="Select a coloring style"
            density="compact"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-spacer />
        <v-col cols="10">
          <template v-if="coloring_style_key === color_dict['value']">
            <ViewerOptionsColorPicker v-model="color" />
          </template>
          <template v-if="coloring_style_key === textures_dict['value']">
            <ViewerOptionsTexturesSelector v-model="textures" :id="id" />
          </template>
          <template v-if="coloring_style_key === vertex_dict['value']">
            <ViewerOptionsVertexAttributeSelector
              v-model:vertex_attribute_name="vertex_attribute_name"
              v-model:vertex_attribute_range="vertex_attribute_range"
              v-model:vertex_attribute_color_map="vertex_attribute_color_map"
              :id="id"
              :storePrefix="vertexStorePrefix"
            />
          </template>
          <template v-if="coloring_style_key === edge_dict['value']">
            <ViewerOptionsEdgeAttributeSelector
              v-model:edge_attribute_name="edge_attribute_name"
              v-model:edge_attribute_range="edge_attribute_range"
              v-model:edge_attribute_color_map="edge_attribute_color_map"
              :id="id"
              :storePrefix="edgeStorePrefix"
            />
          </template>
          <template v-if="coloring_style_key === cell_dict['value']">
            <ViewerOptionsCellAttributeSelector
              v-model:cell_attribute_name="cell_attribute_name"
              v-model:cell_attribute_range="cell_attribute_range"
              v-model:cell_attribute_color_map="cell_attribute_color_map"
              :id="id"
              :storePrefix="cellStorePrefix"
            />
          </template>
          <template v-if="coloring_style_key === polygon_dict['value']">
            <ViewerOptionsPolygonAttributeSelector
              v-model:polygon_attribute_name="polygon_attribute_name"
              v-model:polygon_attribute_range="polygon_attribute_range"
              v-model:polygon_attribute_color_map="polygon_attribute_color_map"
              :id="id"
              :storePrefix="polygonStorePrefix"
            />
          </template>
          <template v-if="coloring_style_key === polyhedron_dict['value']">
            <ViewerOptionsPolyhedronAttributeSelector
              v-model:polyhedron_attribute_name="polyhedron_attribute_name"
              v-model:polyhedron_attribute_range="polyhedron_attribute_range"
              v-model:polyhedron_attribute_color_map="
                polyhedron_attribute_color_map
              "
              :id="id"
              :storePrefix="polyhedronStorePrefix"
            />
          </template>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>
