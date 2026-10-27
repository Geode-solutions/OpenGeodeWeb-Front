<script setup lang="ts">
import {
  MESH_ELEMENT_KINDS,
  MODEL_COMPONENT_ATTRIBUTE_SCHEMAS,
  MODEL_COMPONENT_KINDS,
} from "@ogw_front/utils/attributes";
import type { AttributeSource } from "@ogw_front/utils/threshold";
import type { JsonRpcSchema } from "@ogw_shared/utils/types.js";
import type { ThresholdAttribute } from "@ogw_internal/stores/hybrid_viewer/filters";
import ThresholdCard from "@ogw_front/components/ThresholdCard.vue";
import ToolPanel from "@ogw_front/components/ToolPanel.vue";
import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";
import { useDataStore } from "@ogw_front/stores/data";
import { useDebounceFn } from "@vueuse/core";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const DEBOUNCE_DELAY = 100;

interface Props {
  escapeFunction?: () => void;
}

const { escapeFunction = undefined } = defineProps<Props>();

interface Threshold {
  id: number;
  attribute?: ThresholdAttribute;
}

const show = defineModel<boolean>("show", { default: false });
const dataStore = useDataStore();
const hybridViewerStore = useHybridViewerStore();
const selectedDatasetId = ref<string>();
const sources = ref<AttributeSource[]>([]);
let lastThresholdId = 0;
function newThreshold(): Threshold {
  lastThresholdId += 1;
  return { id: lastThresholdId };
}
const thresholds = ref<Threshold[]>([newThreshold()]);
const cards = useTemplateRef("cards");

const allItems = dataStore.refAllItems();
const availableDatasets = computed<{ title: string; value: string }[]>(() =>
  allItems.value.map((item) => ({
    title: item.name || item.id,
    value: item.id,
  })),
);

function attributeSchema(kind: string, isModel: boolean, route: "names" | "range"): JsonRpcSchema {
  const prefix = isModel ? "model_component_" : "";
  return back_schemas.opengeodeweb_back[
    `${prefix}${kind}_attribute_${route}` as keyof typeof back_schemas.opengeodeweb_back
  ] as JsonRpcSchema;
}

function attributeSource(
  kind: string,
  title: string,
  params: { id: string; component_ids?: string[] },
  modelType?: string,
): AttributeSource {
  const isModel = modelType !== undefined;
  const schema = attributeSchema(kind, isModel, "names");
  return {
    title: `${title}${kind} attribute`,
    schemas: { names: schema, range: attributeSchema(kind, isModel, "range") },
    timeStepKey:
      modelType === undefined
        ? schema.$id
        : (MODEL_COMPONENT_ATTRIBUTE_SCHEMAS[modelType]?.[kind]?.$id ?? schema.$id),
    params,
    location: kind === "vertex" ? "point" : "cell",
  };
}

async function fetchSources(id: string): Promise<AttributeSource[]> {
  const item = await dataStore.item(id);
  if (item.viewer_type !== "model") {
    return ["vertex", MESH_ELEMENT_KINDS[item.geode_object_type]]
      .filter((kind): kind is string => kind !== undefined)
      .map((kind) => attributeSource(kind, "", { id }));
  }
  const modelSources = await Promise.all(
    Object.entries(MODEL_COMPONENT_KINDS).map(async ([type, kinds]) => {
      const component_ids = await dataStore.getMeshComponentGeodeIds(id, type);
      if (component_ids.length === 0) {
        return [];
      }
      return kinds.map((kind) => attributeSource(kind, `${type} `, { id, component_ids }, type));
    }),
  );
  return modelSources.flat();
}

async function applyThresholds(): Promise<void> {
  if (!selectedDatasetId.value) {
    return;
  }
  await hybridViewerStore.setThreshold(
    [selectedDatasetId.value],
    thresholds.value
      .map((threshold) => threshold.attribute)
      .filter((attribute): attribute is ThresholdAttribute => attribute !== undefined),
  );
}

const debouncedApply = useDebounceFn(() => applyThresholds(), DEBOUNCE_DELAY);

function addThreshold(): void {
  thresholds.value.push(newThreshold());
}

function removeThreshold(index: number): void {
  thresholds.value.splice(index, 1);
}

async function resetRanges(): Promise<void> {
  await Promise.all((cards.value ?? []).map((card) => card?.resetRange()));
}

async function removeThresholds(): Promise<void> {
  thresholds.value = [newThreshold()];
  if (selectedDatasetId.value) {
    await hybridViewerStore.setThreshold([selectedDatasetId.value], []);
  }
}

watch(selectedDatasetId, async (id, previousId) => {
  if (previousId) {
    await hybridViewerStore.setThreshold([previousId], []);
  }
  thresholds.value = [newThreshold()];
  sources.value = id ? await fetchSources(id) : [];
});

watch(
  thresholds,
  () => {
    debouncedApply();
  },
  { deep: true },
);

watch(show, (visible) => {
  if (visible) {
    applyThresholds();
  }
});
</script>

<template>
  <ToolPanel
    v-model="show"
    data-testid="thresholdFilterPanel"
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

      <template v-if="selectedDatasetId">
        <v-divider class="my-2" />
        <v-row align="center" justify="space-between" no-gutters class="mb-2">
          <v-col class="text-caption font-weight-bold">Thresholds ({{ thresholds.length }})</v-col>
          <v-col cols="auto">
            <v-btn
              data-testid="addThresholdButton"
              size="x-small"
              variant="tonal"
              color="primary"
              icon="mdi-plus"
              @click="addThreshold"
            />
          </v-col>
        </v-row>

        <ThresholdCard
          v-for="(threshold, idx) in thresholds"
          :key="threshold.id"
          ref="cards"
          v-model:threshold="threshold.attribute"
          :dataset-id="selectedDatasetId"
          :sources="sources"
          :index="idx"
          @remove="removeThreshold(idx)"
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
          @click="removeThresholds"
        >
          Remove Threshold
        </v-btn>
        <v-btn
          data-testid="resetThresholdButton"
          variant="tonal"
          size="small"
          color="secondary"
          class="text-caption text-none"
          @click="resetRanges"
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
