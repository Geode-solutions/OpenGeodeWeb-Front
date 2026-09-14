<script setup lang="ts">
// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
import ViewerOptionsAttributeSelector from "@ogw_front/components/Viewer/Options/AttributeSelector.vue";
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";
import ViewerOptionsTexturesSelector from "@ogw_front/components/Viewer/Options/TexturesSelector.vue";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import type { JsonRpcSchema } from "#shared/utils/types.js";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface Texture {
  id: string;
  texture_name: string;
}

interface CapabilityConfig {
  available?: boolean;
  hasColorMap?: boolean;
}

interface Schemas {
  vertex?: JsonRpcSchema;
  edge?: JsonRpcSchema;
  cell?: JsonRpcSchema;
  polygon?: JsonRpcSchema;
  polyhedron?: JsonRpcSchema;
}

const coloring_style_key = defineModel<string>("coloring_style_key");

const color = defineModel<RGBAColor>("color");
const textures = defineModel<Texture[]>("textures");

const vertex_attribute_name = defineModel<string>("vertex_attribute_name");
const vertex_attribute_item = defineModel<number>("vertex_attribute_item");
const vertex_attribute_range = defineModel<(number | undefined)[]>("vertex_attribute_range");
const vertex_attribute_color_map = defineModel<string>("vertex_attribute_color_map");
const vertex_attribute_no_data_color = defineModel<RGBAColor>("vertex_attribute_no_data_color");

const edge_attribute_name = defineModel<string>("edge_attribute_name");
const edge_attribute_item = defineModel<number>("edge_attribute_item");
const edge_attribute_range = defineModel<(number | undefined)[]>("edge_attribute_range");
const edge_attribute_color_map = defineModel<string>("edge_attribute_color_map");
const edge_attribute_no_data_color = defineModel<RGBAColor>("edge_attribute_no_data_color");

const cell_attribute_name = defineModel<string>("cell_attribute_name");
const cell_attribute_item = defineModel<number>("cell_attribute_item");
const cell_attribute_range = defineModel<(number | undefined)[]>("cell_attribute_range");
const cell_attribute_color_map = defineModel<string>("cell_attribute_color_map");
const cell_attribute_no_data_color = defineModel<RGBAColor>("cell_attribute_no_data_color");

const polygon_attribute_name = defineModel<string>("polygon_attribute_name");
const polygon_attribute_item = defineModel<number>("polygon_attribute_item");
const polygon_attribute_range = defineModel<(number | undefined)[]>("polygon_attribute_range");
const polygon_attribute_color_map = defineModel<string>("polygon_attribute_color_map");
const polygon_attribute_no_data_color = defineModel<RGBAColor>("polygon_attribute_no_data_color");

const polyhedron_attribute_name = defineModel<string>("polyhedron_attribute_name");
const polyhedron_attribute_item = defineModel<number>("polyhedron_attribute_item");
const polyhedron_attribute_range = defineModel<(number | undefined)[]>(
  "polyhedron_attribute_range",
);
const polyhedron_attribute_color_map = defineModel<string>("polyhedron_attribute_color_map");
const polyhedron_attribute_no_data_color = defineModel<RGBAColor>(
  "polyhedron_attribute_no_data_color",
);

interface Props {
  id: string;
  componentIds?: string[];
  capabilities?: Record<string, CapabilityConfig>;
  schemas?: Schemas;
  allowRandom?: boolean;
}

const {
  id,
  componentIds = undefined,
  capabilities = {},
  schemas = {},
  allowRandom = false,
} = defineProps<Props>();

const vertexSchema = schemas.vertex || back_schemas.opengeodeweb_back.vertex_attribute_names;
const edgeSchema = schemas.edge || back_schemas.opengeodeweb_back.edge_attribute_names;
const cellSchema = schemas.cell || back_schemas.opengeodeweb_back.cell_attribute_names;
const polygonSchema = schemas.polygon || back_schemas.opengeodeweb_back.polygon_attribute_names;
const polyhedronSchema =
  schemas.polyhedron || back_schemas.opengeodeweb_back.polyhedron_attribute_names;

function isAvailable(key: string) {
  if (capabilities[key] && capabilities[key].available === false) {
    return false;
  }
  return true;
}

function hasColorMap(key: string) {
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
    if (key === undefined || !(key in names) || names[key as keyof typeof names]) {
      coloring_style_key.value = key;
    }
  },
);

watch(
  coloring_style_key,
  (value) => {
    if (value === undefined) {
      return;
    }
    const index = coloring_styles.value.values.indexOf(value);
    if (index !== -1) {
      coloring_style_label.value = coloring_styles.value.labels[index] ?? "";
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
          v-model:attributeName="vertex_attribute_name"
          v-model:attributeItem="vertex_attribute_item"
          v-model:attributeRange="vertex_attribute_range"
          v-model:attributeColorMap="vertex_attribute_color_map"
          v-model:attributeNoDataColor="vertex_attribute_no_data_color"
          :id="id"
          :componentIds="componentIds"
          :schema="vertexSchema"
        />
      </template>
      <template v-if="active_key === edge_dict['value'] && hasColorMap('edge')">
        <ViewerOptionsAttributeSelector
          v-model:attributeName="edge_attribute_name"
          v-model:attributeItem="edge_attribute_item"
          v-model:attributeRange="edge_attribute_range"
          v-model:attributeColorMap="edge_attribute_color_map"
          v-model:attributeNoDataColor="edge_attribute_no_data_color"
          :id="id"
          :componentIds="componentIds"
          :schema="edgeSchema"
        />
      </template>
      <template v-if="active_key === cell_dict['value'] && hasColorMap('cell')">
        <ViewerOptionsAttributeSelector
          v-model:attributeName="cell_attribute_name"
          v-model:attributeItem="cell_attribute_item"
          v-model:attributeRange="cell_attribute_range"
          v-model:attributeColorMap="cell_attribute_color_map"
          v-model:attributeNoDataColor="cell_attribute_no_data_color"
          :id="id"
          :componentIds="componentIds"
          :schema="cellSchema"
        />
      </template>
      <template v-if="active_key === polygon_dict['value'] && hasColorMap('polygon')">
        <ViewerOptionsAttributeSelector
          v-model:attributeName="polygon_attribute_name"
          v-model:attributeItem="polygon_attribute_item"
          v-model:attributeRange="polygon_attribute_range"
          v-model:attributeColorMap="polygon_attribute_color_map"
          v-model:attributeNoDataColor="polygon_attribute_no_data_color"
          :id="id"
          :componentIds="componentIds"
          :schema="polygonSchema"
        />
      </template>
      <template v-if="active_key === polyhedron_dict['value'] && hasColorMap('polyhedron')">
        <ViewerOptionsAttributeSelector
          v-model:attributeName="polyhedron_attribute_name"
          v-model:attributeItem="polyhedron_attribute_item"
          v-model:attributeRange="polyhedron_attribute_range"
          v-model:attributeColorMap="polyhedron_attribute_color_map"
          v-model:attributeNoDataColor="polyhedron_attribute_no_data_color"
          :id="id"
          :componentIds="componentIds"
          :schema="polyhedronSchema"
        />
      </template>
    </v-col>
  </v-row>
</template>
