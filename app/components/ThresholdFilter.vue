<script setup lang="ts">
import type { JsonRpcSchema } from "@ogw_shared/utils/types.js";
import ToolPanel from "@ogw_front/components/ToolPanel.vue";
import ViewerOptionsAttributeRangeSelector from "@ogw_front/components/Viewer/Options/AttributeRangeSelector.vue";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";
import { getAttributeRange } from "@ogw_front/utils/attributes";
import { useBackStore } from "@ogw_front/stores/back";
import { useDataStore } from "@ogw_front/stores/data";
import { useDebounceFn } from "@vueuse/core";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const DEBOUNCE_DELAY = 100;

const MESH_ELEMENT_KINDS: Record<string, string> = {
  EdgedCurve2D: "edge",
  EdgedCurve3D: "edge",
  LightRegularGrid2D: "cell",
  LightRegularGrid3D: "cell",
  RegularGrid2D: "cell",
  RegularGrid3D: "cell",
  PolygonalSurface2D: "polygon",
  PolygonalSurface3D: "polygon",
  TriangulatedSurface2D: "polygon",
  TriangulatedSurface3D: "polygon",
  HybridSolid3D: "polyhedron",
  PolyhedralSolid3D: "polyhedron",
  TetrahedralSolid3D: "polyhedron",
};

const MODEL_COMPONENT_KINDS: Record<string, string[]> = {
  Corner: ["vertex"],
  Line: ["vertex", "edge"],
  Surface: ["vertex", "polygon"],
  Block: ["vertex", "polyhedron"],
};

interface Props {
  escapeFunction?: () => void;
}

const { escapeFunction = undefined } = defineProps<Props>();

interface AttributeSource {
  title: string;
  schema: JsonRpcSchema;
  params: Record<string, unknown>;
  location: "point" | "cell";
}

interface AttributeInfo {
  attribute_name: string;
  nb_items: number;
  [key: string]: unknown;
}

const show = defineModel<boolean>("show", { default: false });
const backStore = useBackStore();
const dataStore = useDataStore();
const hybridViewerStore = useHybridViewerStore();
const selectedDatasetId = ref<string>();
const sources = ref<AttributeSource[]>([]);
const selectedSourceIndex = ref<number>();
const attributes = ref<AttributeInfo[]>([]);
const attributeName = ref<string>();
const attributeItem = ref<number>(0);
const minimum = ref<number>();
const maximum = ref<number>();

const allItems = dataStore.refAllItems();
const availableDatasets = computed<{ title: string; value: string }[]>(() =>
  allItems.value.map((item) => ({
    title: item.name || item.id,
    value: item.id,
  })),
);
const availableSources = computed<{ title: string; value: number }[]>(() =>
  sources.value.map((source, index) => ({ title: source.title, value: index })),
);
const currentAttribute = computed<AttributeInfo | undefined>(() =>
  attributes.value.find((attribute) => attribute.attribute_name === attributeName.value),
);
const itemOptions = computed<{ title: string; value: number }[]>(() =>
  Array.from({ length: currentAttribute.value?.nb_items ?? 0 }, (_, index) => ({
    title: `Item ${index + 1}`,
    value: index,
  })),
);

function attributeSchema(kind: string, isModel: boolean): JsonRpcSchema {
  const prefix = isModel ? "model_component_" : "";
  return back_schemas.opengeodeweb_back[
    `${prefix}${kind}_attribute_names` as keyof typeof back_schemas.opengeodeweb_back
  ] as JsonRpcSchema;
}

function attributeSource(
  kind: string,
  title: string,
  params: Record<string, unknown>,
  isModel: boolean,
): AttributeSource {
  return {
    title: `${title}${kind} attribute`,
    schema: attributeSchema(kind, isModel),
    params,
    location: kind === "vertex" ? "point" : "cell",
  };
}

async function fetchSources(id: string): Promise<AttributeSource[]> {
  const item = await dataStore.item(id);
  if (item.viewer_type !== "model") {
    return ["vertex", MESH_ELEMENT_KINDS[item.geode_object_type]]
      .filter((kind): kind is string => kind !== undefined)
      .map((kind) => attributeSource(kind, "", { id }, false));
  }
  const modelSources = await Promise.all(
    Object.entries(MODEL_COMPONENT_KINDS).map(async ([type, kinds]) => {
      const component_ids = await dataStore.getMeshComponentGeodeIds(id, type);
      if (component_ids.length === 0) {
        return [];
      }
      return kinds.map((kind) => attributeSource(kind, `${type} `, { id, component_ids }, true));
    }),
  );
  return modelSources.flat();
}

async function applyThreshold(): Promise<void> {
  const source = sources.value[selectedSourceIndex.value ?? -1];
  if (
    !selectedDatasetId.value ||
    !source ||
    !attributeName.value ||
    minimum.value === undefined ||
    maximum.value === undefined
  ) {
    return;
  }
  await hybridViewerStore.setThreshold([selectedDatasetId.value], {
    name: attributeName.value,
    location: source.location,
    item: attributeItem.value,
    minimum: minimum.value,
    maximum: maximum.value,
  });
}

const debouncedApply = useDebounceFn(() => applyThreshold(), DEBOUNCE_DELAY);

function resetRange(): void {
  const { min, max } = getAttributeRange(
    currentAttribute.value as Parameters<typeof getAttributeRange>[0],
    attributeItem.value,
  );
  minimum.value = min;
  maximum.value = max;
}

async function removeThreshold(): Promise<void> {
  if (selectedDatasetId.value) {
    await hybridViewerStore.setThreshold([selectedDatasetId.value]);
  }
}

watch(selectedDatasetId, async (id, previousId) => {
  if (previousId) {
    await hybridViewerStore.setThreshold([previousId]);
  }
  selectedSourceIndex.value = undefined;
  sources.value = id ? await fetchSources(id) : [];
});

watch(selectedSourceIndex, async (index) => {
  attributeName.value = undefined;
  attributes.value = [];
  const source = sources.value[index ?? -1];
  if (!source) {
    return;
  }
  const response = (await backStore.request({
    schema: source.schema,
    params: source.params,
  })) as { attributes: AttributeInfo[] };
  attributes.value = response.attributes;
});

watch(attributeName, () => {
  attributeItem.value = 0;
  resetRange();
});

watch(attributeItem, () => {
  resetRange();
});

watch([minimum, maximum], () => {
  debouncedApply();
});

watch(show, (visible) => {
  if (visible) {
    applyThreshold();
  }
});
</script>

<template>
  <ToolPanel
    v-model="show"
    title="Threshold Filter"
    :width="340"
    :click-outside="false"
    :escapeFunction="escapeFunction"
  >
    <v-card-text class="pa-3 max-panel-height overflow-y-auto overflow-x-hidden">
      <v-select
        v-model="selectedDatasetId"
        data-testid="thresholdDatasetSelect"
        :items="availableDatasets"
        label="Select a dataset"
        variant="outlined"
        density="compact"
        hide-details
        class="mb-3 text-caption"
      />

      <v-select
        v-if="selectedDatasetId"
        v-model="selectedSourceIndex"
        data-testid="thresholdAttributeTypeSelect"
        :items="availableSources"
        label="Select an attribute type"
        variant="outlined"
        density="compact"
        hide-details
        class="mb-3 text-caption"
      />

      <v-select
        v-if="selectedSourceIndex !== undefined"
        v-model="attributeName"
        data-testid="thresholdAttributeSelect"
        :items="attributes.map((attribute) => attribute.attribute_name)"
        label="Select an attribute"
        variant="outlined"
        density="compact"
        hide-details
        class="mb-3 text-caption"
      />

      <v-select
        v-if="currentAttribute && currentAttribute.nb_items > 1"
        v-model="attributeItem"
        data-testid="thresholdItemSelect"
        :items="itemOptions"
        label="Select an item"
        variant="outlined"
        density="compact"
        hide-details
        class="mb-3 text-caption"
      />

      <template v-if="attributeName">
        <v-divider class="my-3" />
        <span class="text-caption font-weight-bold">Range</span>
        <ViewerOptionsAttributeRangeSelector
          v-model:minimum="minimum"
          v-model:maximum="maximum"
          class="mt-2"
          @reset="resetRange"
        />
      </template>
    </v-card-text>

    <template #actions>
      <v-card-actions class="justify-space-between px-3 pb-3 pt-0">
        <v-btn
          data-testid="removeThresholdButton"
          variant="text"
          size="small"
          color="error"
          class="text-caption text-none"
          @click="removeThreshold"
        >
          Remove Threshold
        </v-btn>
        <v-btn
          data-testid="resetThresholdButton"
          variant="tonal"
          size="small"
          color="secondary"
          class="text-caption text-none"
          @click="resetRange"
        >
          Reset
        </v-btn>
      </v-card-actions>
    </template>
  </ToolPanel>
</template>

<style scoped>
.max-panel-height {
  max-height: 520px;
}
</style>
