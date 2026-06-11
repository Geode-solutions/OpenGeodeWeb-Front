<script setup>
import ViewerOptionsAttributeSelector from "@ogw_front/components/Viewer/Options/AttributeSelector.vue";
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";
import ViewerOptionsTexturesSelector from "@ogw_front/components/Viewer/Options/TexturesSelector.vue";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";

const coloring_style_key = defineModel("coloring_style_key", { type: String });

const color = defineModel("color", { type: Object });
const textures = defineModel("textures", { type: Array });

const vertex_attribute_name = defineModel("vertex_attribute_name", { type: String });
const vertex_attribute_range = defineModel("vertex_attribute_range", { type: Array });
const vertex_attribute_color_map = defineModel("vertex_attribute_color_map", { type: String });

const edge_attribute_name = defineModel("edge_attribute_name", { type: String });
const edge_attribute_range = defineModel("edge_attribute_range", { type: Array });
const edge_attribute_color_map = defineModel("edge_attribute_color_map", { type: String });

const cell_attribute_name = defineModel("cell_attribute_name", { type: String });
const cell_attribute_range = defineModel("cell_attribute_range", { type: Array });
const cell_attribute_color_map = defineModel("cell_attribute_color_map", { type: String });

const polygon_attribute_name = defineModel("polygon_attribute_name", { type: String });
const polygon_attribute_range = defineModel("polygon_attribute_range", { type: Array });
const polygon_attribute_color_map = defineModel("polygon_attribute_color_map", { type: String });

const polyhedron_attribute_name = defineModel("polyhedron_attribute_name", { type: String });
const polyhedron_attribute_range = defineModel("polyhedron_attribute_range", { type: Array });
const polyhedron_attribute_color_map = defineModel("polyhedron_attribute_color_map", {
  type: String,
});

const {
  id,
  componentId,
  capabilities,
  schemas,
  allowRandom = false,
} = defineProps({
  id: { type: String, required: true },
  componentId: { type: String, default: undefined },
  capabilities: {
    type: Object,
    default: () => ({}),
  },
  schemas: {
    type: Object,
    default: () => ({}),
  },
  allowRandom: {
    type: Boolean,
    default: false,
  },
});

const vertexSchema = schemas.vertex || back_schemas.opengeodeweb_back.vertex_attribute_names;
const edgeSchema = schemas.edge || back_schemas.opengeodeweb_back.edge_attribute_names;
const cellSchema = schemas.cell || back_schemas.opengeodeweb_back.cell_attribute_names;
const polygonSchema = schemas.polygon || back_schemas.opengeodeweb_back.polygon_attribute_names;
const polyhedronSchema =
  schemas.polyhedron || back_schemas.opengeodeweb_back.polyhedron_attribute_names;

function isAvailable(key) {
  if (capabilities[key] && capabilities[key].available === false) {
    return false;
  }
  return true;
}

function hasColorMap(key) {
  if (capabilities[key] && capabilities[key].hasColorMap === false) {
    return false;
  }
  return true;
}

const has_color = computed(() => color.value !== undefined && isAvailable("color"));
const has_textures = computed(() => textures.value !== undefined && isAvailable("textures"));
const has_vertex = computed(
  () =>
    vertex_attribute_range.value !== undefined && isAvailable("vertex") && hasColorMap("vertex"),
);
const has_edge = computed(
  () => edge_attribute_range.value !== undefined && isAvailable("edge") && hasColorMap("edge"),
);
const has_cells = computed(
  () => cell_attribute_range.value !== undefined && isAvailable("cell") && hasColorMap("cell"),
);
const has_polygons = computed(
  () =>
    polygon_attribute_range.value !== undefined && isAvailable("polygon") && hasColorMap("polygon"),
);
const has_polyhedra = computed(
  () =>
    polyhedron_attribute_range.value !== undefined &&
    isAvailable("polyhedron") &&
    hasColorMap("polyhedron"),
);

const color_dict = { name: "Constant", value: "constant" };
const random_dict = { name: "Random", value: "random" };
const textures_dict = { name: "Textures", value: "textures" };
const vertex_dict = { name: "Vertex attribute", value: "vertex" };
const edge_dict = { name: "Edge attribute", value: "edge" };
const cell_dict = { name: "Cell attribute", value: "cell" };
const polygon_dict = { name: "Polygon attribute", value: "polygon" };
const polyhedron_dict = {
  name: "Polyhedron attribute",
  value: "polyhedron",
};
const coloring_styles = computed(() => {
  const array = [];
  if (has_color.value) {
    array.push(color_dict);
    if (allowRandom) {
      array.push(random_dict);
    }
  }
  if (has_textures.value) {
    array.push(textures_dict);
  }
  if (has_vertex.value) {
    array.push(vertex_dict);
  }
  if (has_edge.value) {
    array.push(edge_dict);
  }
  if (has_cells.value) {
    array.push(cell_dict);
  }
  if (has_polygons.value) {
    array.push(polygon_dict);
  }
  if (has_polyhedra.value) {
    array.push(polyhedron_dict);
  }

  const labels = array.map((coloring) => coloring.name);
  const values = array.map((coloring) => coloring.value);

  return { labels, values };
});

const coloring_style_label = ref("");

const active_key = computed(() => {
  const index = coloring_styles.value.labels.indexOf(coloring_style_label.value);
  return index === -1 ? coloring_style_key.value : coloring_styles.value.values[index];
});

watch(
  [
    coloring_style_label,
    vertex_attribute_name,
    edge_attribute_name,
    cell_attribute_name,
    polygon_attribute_name,
    polyhedron_attribute_name,
  ],
  () => {
    const key = active_key.value;
    const names = {
      vertex: vertex_attribute_name.value,
      edge: edge_attribute_name.value,
      cell: cell_attribute_name.value,
      polygon: polygon_attribute_name.value,
      polyhedron: polyhedron_attribute_name.value,
    };
    if (!(key in names) || names[key]) {
      coloring_style_key.value = key;
    }
  }
);

watch(
  coloring_style_key,
  (value) => {
    const index = coloring_styles.value.values.indexOf(value);
    if (index !== -1) {
      coloring_style_label.value = coloring_styles.value.labels[index];
    }
  },
  { immediate: true },
);
</script>
<template>
  <v-divider class="my-2 mx-2" />
  <v-row justify="center" align="center" no-gutters class="px-2">
    <v-col cols="auto" class="mr-2">
      <v-icon size="18" icon="mdi-format-color-fill" v-tooltip:left="'Coloring'" />
    </v-col>
    <v-col>
      <v-select
        data-testid="coloringStyleSelector"
        v-model="coloring_style_label"
        :items="coloring_styles.labels"
        label="Select coloring style"
        density="compact"
        hide-details
      />
    </v-col>
  </v-row>
  <v-row class="mt-3 px-2" no-gutters>
    <v-col cols="12" class="ps-7 pe-1">
      <template v-if="active_key === color_dict['value']">
        <ViewerOptionsColorPicker v-model="color" />
      </template>
      <template v-if="active_key === textures_dict['value']">
        <ViewerOptionsTexturesSelector v-model="textures" :id="id" />
      </template>
      <template v-if="active_key === vertex_dict['value'] && hasColorMap('vertex')">
        <ViewerOptionsAttributeSelector
          v-model:name="vertex_attribute_name"
          v-model:range="vertex_attribute_range"
          v-model:colorMap="vertex_attribute_color_map"
          :id="id"
          :componentId="componentId"
          :schema="vertexSchema"
        />
      </template>
      <template v-if="active_key === edge_dict['value'] && hasColorMap('edge')">
        <ViewerOptionsAttributeSelector
          v-model:name="edge_attribute_name"
          v-model:range="edge_attribute_range"
          v-model:colorMap="edge_attribute_color_map"
          :id="id"
          :componentId="componentId"
          :schema="edgeSchema"
        />
      </template>
      <template v-if="active_key === cell_dict['value'] && hasColorMap('cell')">
        <ViewerOptionsAttributeSelector
          v-model:name="cell_attribute_name"
          v-model:range="cell_attribute_range"
          v-model:colorMap="cell_attribute_color_map"
          :id="id"
          :componentId="componentId"
          :schema="cellSchema"
        />
      </template>
      <template v-if="active_key === polygon_dict['value'] && hasColorMap('polygon')">
        <ViewerOptionsAttributeSelector
          v-model:name="polygon_attribute_name"
          v-model:range="polygon_attribute_range"
          v-model:colorMap="polygon_attribute_color_map"
          :id="id"
          :componentId="componentId"
          :schema="polygonSchema"
        />
      </template>
      <template v-if="active_key === polyhedron_dict['value'] && hasColorMap('polyhedron')">
        <ViewerOptionsAttributeSelector
          v-model:name="polyhedron_attribute_name"
          v-model:range="polyhedron_attribute_range"
          v-model:colorMap="polyhedron_attribute_color_map"
          :id="id"
          :componentId="componentId"
          :schema="polyhedronSchema"
        />
      </template>
    </v-col>
  </v-row>
</template>
