<script setup lang="ts">
import type {
  AttributeColorMap,
  AttributeRange,
  AttributeTimeStep,
  ColoringType,
} from "@ogw_front/types/attribute";
import type {
  AttributeItem,
  AttributeName,
  ColorRGBA,
  Opacity,
} from "@geode/opengeodeweb-viewer/schema_types";
import {
  COLORING_STYLES,
  type Schemas,
  buildColoringStyles,
  resolveAttributeSchemas,
} from "@ogw_front/utils/coloring_styles";
import type { ColoringCapabilities } from "@ogw_front/types/props/viewer/options";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import type { Label } from "@ogw_front/types/ui";
import type { ModelComponentId } from "@ogw_front/types/identifiers";
import type { NonEmptyArray } from "@ogw_front/utils/arrays";
import type { RangesPerData } from "@ogw_front/composables/batch_style";
import type { Texture } from "@ogw_front/types/texture";
import ViewerOptionsAttributeSelector from "@ogw_front/components/Viewer/Options/AttributeSelector.vue";
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";
import ViewerOptionsOpacitySlider from "@ogw_front/components/Viewer/Options/Sliders/Opacity.vue";
import ViewerOptionsTexturesSelector from "@ogw_front/components/Viewer/Options/TexturesSelector.vue";

// The coloring types a coloring selector offers: their labels and, at the same positions, their coloring types
interface ColoringStyleChoices {
  labels: Label[];
  values: ColoringType[];
}

interface Props {
  dataId: DataId;
  componentIds?: NonEmptyArray<ModelComponentId>;
  capabilities?: ColoringCapabilities;
  schemas?: Schemas;
  allowRandom?: boolean;
}

interface Emits {
  vertex_attribute_ranges_per_data: [ranges: RangesPerData];
  edge_attribute_ranges_per_data: [ranges: RangesPerData];
  cell_attribute_ranges_per_data: [ranges: RangesPerData];
  polygon_attribute_ranges_per_data: [ranges: RangesPerData];
  polyhedron_attribute_ranges_per_data: [ranges: RangesPerData];
}

const coloringStyleKey = defineModel<ColoringType>("coloring_style_key");

const emit = defineEmits<Emits>();

const color = defineModel<ColorRGBA>("color");
const opacity = defineModel<Opacity>("opacity");
const textures = defineModel<Texture[]>("textures");

const vertexAttributeName = defineModel<AttributeName>("vertex_attribute_name");
const vertexAttributeItem = defineModel<AttributeItem>("vertex_attribute_item");
const vertexAttributeRange = defineModel<AttributeRange>("vertex_attribute_range");
const vertexAttributeColorMap = defineModel<AttributeColorMap>("vertex_attribute_color_map");
const vertexAttributeNoDataColor = defineModel<ColorRGBA>("vertex_attribute_no_data_color");
const vertexAttributeTimeStep = defineModel<AttributeTimeStep>("vertex_attribute_time_step");

const edgeAttributeName = defineModel<AttributeName>("edge_attribute_name");
const edgeAttributeItem = defineModel<AttributeItem>("edge_attribute_item");
const edgeAttributeRange = defineModel<AttributeRange>("edge_attribute_range");
const edgeAttributeColorMap = defineModel<AttributeColorMap>("edge_attribute_color_map");
const edgeAttributeNoDataColor = defineModel<ColorRGBA>("edge_attribute_no_data_color");
const edgeAttributeTimeStep = defineModel<AttributeTimeStep>("edge_attribute_time_step");

const cellAttributeName = defineModel<AttributeName>("cell_attribute_name");
const cellAttributeItem = defineModel<AttributeItem>("cell_attribute_item");
const cellAttributeRange = defineModel<AttributeRange>("cell_attribute_range");
const cellAttributeColorMap = defineModel<AttributeColorMap>("cell_attribute_color_map");
const cellAttributeNoDataColor = defineModel<ColorRGBA>("cell_attribute_no_data_color");
const cellAttributeTimeStep = defineModel<AttributeTimeStep>("cell_attribute_time_step");

const polygonAttributeName = defineModel<AttributeName>("polygon_attribute_name");
const polygonAttributeItem = defineModel<AttributeItem>("polygon_attribute_item");
const polygonAttributeRange = defineModel<AttributeRange>("polygon_attribute_range");
const polygonAttributeColorMap = defineModel<AttributeColorMap>("polygon_attribute_color_map");
const polygonAttributeNoDataColor = defineModel<ColorRGBA>("polygon_attribute_no_data_color");
const polygonAttributeTimeStep = defineModel<AttributeTimeStep>("polygon_attribute_time_step");

const polyhedronAttributeName = defineModel<AttributeName>("polyhedron_attribute_name");
const polyhedronAttributeItem = defineModel<AttributeItem>("polyhedron_attribute_item");
const polyhedronAttributeRange = defineModel<AttributeRange>("polyhedron_attribute_range");
const polyhedronAttributeColorMap = defineModel<AttributeColorMap>(
  "polyhedron_attribute_color_map",
);
const polyhedronAttributeNoDataColor = defineModel<ColorRGBA>("polyhedron_attribute_no_data_color");
const polyhedronAttributeTimeStep = defineModel<AttributeTimeStep>(
  "polyhedron_attribute_time_step",
);

const {
  dataId,
  componentIds = undefined,
  capabilities = {},
  schemas = {},
  allowRandom = false,
} = defineProps<Props>();

const {
  vertex: vertexSchemas,
  edge: edgeSchemas,
  cell: cellSchemas,
  polygon: polygonSchemas,
  polyhedron: polyhedronSchemas,
} = resolveAttributeSchemas(schemas);

function isAvailable(key: ColoringType): boolean {
  return capabilities[key]?.available !== false;
}

function hasColorMap(key: ColoringType): boolean {
  return capabilities[key]?.hasColorMap !== false;
}

const hasColor = computed<boolean>(() => color.value !== undefined && isAvailable("color"));
const hasTextures = computed<boolean>(
  () => textures.value !== undefined && isAvailable("textures"),
);
const hasVertex = computed<boolean>(
  () => vertexAttributeRange.value !== undefined && isAvailable("vertex") && hasColorMap("vertex"),
);
const hasEdge = computed<boolean>(
  () => edgeAttributeRange.value !== undefined && isAvailable("edge") && hasColorMap("edge"),
);
const hasCells = computed<boolean>(
  () => cellAttributeRange.value !== undefined && isAvailable("cell") && hasColorMap("cell"),
);
const hasPolygons = computed<boolean>(
  () =>
    polygonAttributeRange.value !== undefined && isAvailable("polygon") && hasColorMap("polygon"),
);
const hasPolyhedra = computed<boolean>(
  () =>
    polyhedronAttributeRange.value !== undefined &&
    isAvailable("polyhedron") &&
    hasColorMap("polyhedron"),
);

const {
  color: colorDict,
  textures: texturesDict,
  vertex: vertexDict,
  edge: edgeDict,
  cell: cellDict,
  polygon: polygonDict,
  polyhedron: polyhedronDict,
} = COLORING_STYLES;
const coloringStyles = computed<ColoringStyleChoices>(() =>
  buildColoringStyles(
    {
      color: hasColor.value,
      textures: hasTextures.value,
      vertex: hasVertex.value,
      edge: hasEdge.value,
      cell: hasCells.value,
      polygon: hasPolygons.value,
      polyhedron: hasPolyhedra.value,
    },
    allowRandom,
  ),
);

const coloringStyleLabel = ref<Label>("");

const activeKey = computed<ColoringType | undefined>(() => {
  const index = coloringStyles.value.labels.indexOf(coloringStyleLabel.value);
  return index === -1 ? coloringStyleKey.value : coloringStyles.value.values[index];
});

// The constant color picker already edits the opacity as its alpha
const hasOpacity = computed<boolean>(
  () => opacity.value !== undefined && activeKey.value !== colorDict.value,
);

watch(
  [
    coloringStyleLabel,
    vertexAttributeName,
    edgeAttributeName,
    cellAttributeName,
    polygonAttributeName,
    polyhedronAttributeName,
  ],
  () => {
    const key = activeKey.value;
    const names = {
      vertex: vertexAttributeName.value,
      edge: edgeAttributeName.value,
      cell: cellAttributeName.value,
      polygon: polygonAttributeName.value,
      polyhedron: polyhedronAttributeName.value,
    };
    if (key === undefined || !(key in names) || names[key as keyof typeof names]) {
      coloringStyleKey.value = key;
    }
  },
);

watch(
  coloringStyleKey,
  (value) => {
    if (value === undefined) {
      return;
    }
    const index = coloringStyles.value.values.indexOf(value);
    if (index !== -1) {
      coloringStyleLabel.value = coloringStyles.value.labels[index] ?? "";
    }
  },
  { immediate: true },
);
</script>
<template>
  <v-divider class="my-2 mx-2" />
  <v-row justify="center" align="center" no-gutters class="px-2">
    <v-col cols="auto" class="mr-2">
      <v-icon size="18" icon="ph-paint-bucket" v-tooltip:left="'Coloring'" />
    </v-col>
    <v-col>
      <v-select
        data-testid="coloringStyleSelector"
        v-model="coloringStyleLabel"
        :items="coloringStyles.labels"
        label="Select coloring style"
        density="compact"
        hide-details
      />
    </v-col>
  </v-row>
  <v-row class="mt-3 px-2" no-gutters>
    <v-col cols="12" class="ps-7 pe-1">
      <template v-if="activeKey === colorDict['value']">
        <ViewerOptionsColorPicker v-model="color" />
      </template>
      <template v-if="activeKey === texturesDict['value']">
        <ViewerOptionsTexturesSelector v-model="textures" :data-id="dataId" />
      </template>
      <template v-if="activeKey === vertexDict['value'] && hasColorMap('vertex')">
        <ViewerOptionsAttributeSelector
          v-model:attributeName="vertexAttributeName"
          v-model:attributeItem="vertexAttributeItem"
          v-model:attributeRange="vertexAttributeRange"
          v-model:attributeColorMap="vertexAttributeColorMap"
          v-model:attributeNoDataColor="vertexAttributeNoDataColor"
          v-model:attributeTimeStep="vertexAttributeTimeStep"
          @ranges_per_data="emit('vertex_attribute_ranges_per_data', $event)"
          :data-id="dataId"
          :componentIds="componentIds"
          :schemas="vertexSchemas"
        />
      </template>
      <template v-if="activeKey === edgeDict['value'] && hasColorMap('edge')">
        <ViewerOptionsAttributeSelector
          v-model:attributeName="edgeAttributeName"
          v-model:attributeItem="edgeAttributeItem"
          v-model:attributeRange="edgeAttributeRange"
          v-model:attributeColorMap="edgeAttributeColorMap"
          v-model:attributeNoDataColor="edgeAttributeNoDataColor"
          v-model:attributeTimeStep="edgeAttributeTimeStep"
          @ranges_per_data="emit('edge_attribute_ranges_per_data', $event)"
          :data-id="dataId"
          :componentIds="componentIds"
          :schemas="edgeSchemas"
        />
      </template>
      <template v-if="activeKey === cellDict['value'] && hasColorMap('cell')">
        <ViewerOptionsAttributeSelector
          v-model:attributeName="cellAttributeName"
          v-model:attributeItem="cellAttributeItem"
          v-model:attributeRange="cellAttributeRange"
          v-model:attributeColorMap="cellAttributeColorMap"
          v-model:attributeNoDataColor="cellAttributeNoDataColor"
          v-model:attributeTimeStep="cellAttributeTimeStep"
          @ranges_per_data="emit('cell_attribute_ranges_per_data', $event)"
          :data-id="dataId"
          :componentIds="componentIds"
          :schemas="cellSchemas"
        />
      </template>
      <template v-if="activeKey === polygonDict['value'] && hasColorMap('polygon')">
        <ViewerOptionsAttributeSelector
          v-model:attributeName="polygonAttributeName"
          v-model:attributeItem="polygonAttributeItem"
          v-model:attributeRange="polygonAttributeRange"
          v-model:attributeColorMap="polygonAttributeColorMap"
          v-model:attributeNoDataColor="polygonAttributeNoDataColor"
          v-model:attributeTimeStep="polygonAttributeTimeStep"
          @ranges_per_data="emit('polygon_attribute_ranges_per_data', $event)"
          :data-id="dataId"
          :componentIds="componentIds"
          :schemas="polygonSchemas"
        />
      </template>
      <template v-if="activeKey === polyhedronDict['value'] && hasColorMap('polyhedron')">
        <ViewerOptionsAttributeSelector
          v-model:attributeName="polyhedronAttributeName"
          v-model:attributeItem="polyhedronAttributeItem"
          v-model:attributeRange="polyhedronAttributeRange"
          v-model:attributeColorMap="polyhedronAttributeColorMap"
          v-model:attributeNoDataColor="polyhedronAttributeNoDataColor"
          v-model:attributeTimeStep="polyhedronAttributeTimeStep"
          @ranges_per_data="emit('polyhedron_attribute_ranges_per_data', $event)"
          :data-id="dataId"
          :componentIds="componentIds"
          :schemas="polyhedronSchemas"
        />
      </template>
    </v-col>
  </v-row>
  <v-row v-if="hasOpacity" class="mt-2" no-gutters>
    <v-col cols="12">
      <ViewerOptionsOpacitySlider v-model="opacity" />
    </v-col>
  </v-row>
</template>
