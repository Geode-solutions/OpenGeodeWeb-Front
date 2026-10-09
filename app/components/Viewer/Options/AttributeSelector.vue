<script setup lang="ts">
import {
  type AttributeRange,
  type RangesPerData,
  useBatchGroup,
} from "@ogw_front/composables/batch_style";
import { type AttributeRangeInfo, fetchAttributeRange } from "@ogw_front/utils/attribute_range";
import { getAttributeRange, intersectAttributes } from "@ogw_front/utils/attributes";
import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
import type { JsonRpcSchema } from "@ogw_shared/utils/types.js";
import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar.vue";
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";
import ViewerOptionsTimeStepSlider from "@ogw_front/components/Viewer/Options/TimeStepSlider.vue";
import { requestForTargets } from "@ogw_front/utils/request_for_targets";
import { useBackStore } from "@ogw_front/stores/back";

const backStore = useBackStore();

const attributeName = defineModel<string>("attributeName");
const attributeItem = defineModel<number>("attributeItem");
const attributeRange = defineModel<(number | undefined)[]>("attributeRange", {
  default: () => [],
});
const attributeColorMap = defineModel<string>("attributeColorMap");
const attributeNoDataColor = defineModel<typeof DEFAULT_NO_DATA_COLOR>("attributeNoDataColor");
const attributeTimeStep = defineModel<number>("attributeTimeStep");

interface Props {
  id: string;
  componentIds?: string[];
  schema: JsonRpcSchema;
}

const { id, componentIds = undefined, schema } = defineProps<Props>();

interface Emits {
  "update:attributeColorMap": [colorMap: string];
  "update:attributeTimeStep": [timeStep: number];
  ranges_per_data: [ranges: RangesPerData];
}

const emit = defineEmits<Emits>();

interface AttributeInfo {
  attribute_name: string;
  nb_items: number;
  time_steps?: number[];
  [key: string]: unknown;
}

const attributes = ref<AttributeInfo[]>([]);
let attributesPerTarget = new Map<string, AttributeInfo[]>();
const rangesPerTarget = ref(new Map<string, AttributeRangeInfo>());
let rangesName: string | undefined = undefined;
let rangesLoading: Promise<void> = Promise.resolve();

const groupTargetIds = useBatchGroup(() => id);

const currentAttribute = computed<AttributeInfo | undefined>(() =>
  attributes.value.find((attr) => attr.attribute_name === attributeName.value),
);
const timeSteps = computed<number[]>(() => currentAttribute.value?.time_steps ?? []);
const noData = computed<boolean>(() =>
  [...rangesPerTarget.value.values()].some((range) => range.no_data),
);

let committedSeries: string | undefined = undefined;

function commitSeriesTimeStep(): void {
  if (timeSteps.value.length === 0) {
    committedSeries = undefined;
    return;
  }
  const name = currentAttribute.value?.attribute_name;
  if (name === committedSeries) {
    return;
  }
  committedSeries = name;
  const current = attributeTimeStep.value;
  const valid = current !== undefined && current >= 0 && current < timeSteps.value.length;
  emit("update:attributeTimeStep", valid ? current : 0);
}

const cssNoDataColor = computed<string>(() => {
  const { red, green, blue, alpha } = attributeNoDataColor.value ?? DEFAULT_NO_DATA_COLOR;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
});
const rangeMin = computed<number | undefined>({
  get: () => attributeRange.value[0],
  set: (val: number | undefined) => {
    if (val === undefined) {
      return;
    }
    const [, currentMax] = attributeRange.value;
    let newMin = val;
    if (typeof currentMax === "number" && val > currentMax) {
      newMin = currentMax;
    }
    attributeRange.value = [newMin, currentMax];
  },
});
const rangeMax = computed<number | undefined>({
  get: () => attributeRange.value[1],
  set: (val: number | undefined) => {
    if (val === undefined) {
      return;
    }
    const [currentMin] = attributeRange.value;
    let newMax = val;
    if (typeof currentMin === "number" && val < currentMin) {
      newMax = currentMin;
    }
    attributeRange.value = [currentMin, newMax];
  },
});

const componentItems = computed<{ title: string; value: number }[]>(() => {
  if (!currentAttribute.value) {
    return [];
  }
  return Array.from({ length: currentAttribute.value.nb_items }, (_, index) => ({
    title: `Item ${index + 1}`,
    value: index,
  }));
});

function hasSelectedComponent(components: unknown): boolean {
  return Array.isArray(components) && components.length > 0;
}

function requestParams(): { id: string; component_ids?: string[] } | undefined {
  const schemaProperties = schema.properties as Record<string, unknown> | undefined;
  if (schemaProperties?.component_ids === undefined) {
    return { id };
  }
  return hasSelectedComponent(componentIds) ? { id, component_ids: componentIds } : undefined;
}

// Ranges are computed by the back for the selected attribute only, as scanning every step of every series is slow
async function requestRanges(name: string): Promise<void> {
  const targets: [string, { id: string; component_ids?: string[] } | undefined][] =
    groupTargetIds.value
      ? [...attributesPerTarget]
          .filter(([, targetAttributes]) =>
            targetAttributes.some((attribute) => attribute.attribute_name === name),
          )
          .map(([targetId]) => [targetId, { id: targetId }])
      : [[id, requestParams()]];
  const entries = await Promise.all(
    targets.map(async ([targetId, params]): Promise<[string, AttributeRangeInfo | undefined]> => [
      targetId,
      params ? await fetchAttributeRange(schema, params, name) : undefined,
    ]),
  );
  if (rangesName !== name) {
    return;
  }
  rangesPerTarget.value = new Map(
    entries.filter((entry): entry is [string, AttributeRangeInfo] => entry[1] !== undefined),
  );
}

async function loadRanges(name: string): Promise<void> {
  if (name !== rangesName) {
    rangesName = name;
    rangesPerTarget.value = new Map();
    rangesLoading = requestRanges(name);
  }
  await rangesLoading;
}

function applyRange(): void {
  const { min, max } = getAttributeRange(rangesPerTarget.value.get(id), attributeItem.value ?? 0);
  attributeRange.value = [min, max];
}

async function resetRange(): Promise<void> {
  if (currentAttribute.value) {
    await loadRanges(currentAttribute.value.attribute_name);
    applyRange();
  }
}

async function getGroupAttributes(targetIds: string[]): Promise<void> {
  const responses = await requestForTargets<{ attributes: AttributeInfo[] }>(schema, targetIds, {
    attributes: [],
  });
  attributesPerTarget = new Map(
    responses.map(([targetId, response]) => [targetId, response.attributes]),
  );
  attributes.value = intersectAttributes([...attributesPerTarget.values()]);
}

async function initGroupAttribute(name: string, item: number): Promise<void> {
  await loadRanges(name);
  if (attributeName.value !== name) {
    return;
  }
  const ranges = new Map<string, AttributeRange>();
  for (const [targetId, range] of rangesPerTarget.value) {
    const { min, max } = getAttributeRange(range, item);
    ranges.set(targetId, [min, max]);
  }
  emit("update:attributeColorMap", attributeColorMap.value ?? "batlow");
  emit("ranges_per_data", ranges);
}

async function getAttributes(): Promise<void> {
  rangesName = undefined;
  rangesPerTarget.value = new Map();
  if (groupTargetIds.value) {
    await getGroupAttributes(groupTargetIds.value);
    return;
  }
  const params = requestParams();
  if (!params) {
    return;
  }

  await backStore.request(
    { schema, params },
    {
      response_function: (response: unknown) => {
        attributes.value = (response as { attributes: AttributeInfo[] }).attributes;
      },
    },
  );
}

onMounted(async () => {
  await getAttributes();
});

watch(
  () => [id, componentIds, schema],
  async () => {
    await getAttributes();
  },
);

watch([attributeName, attributeItem], async ([name, item]) => {
  if (groupTargetIds.value && name !== undefined) {
    await initGroupAttribute(name, item ?? 0);
  }
});

watch([attributeName, attributeItem, currentAttribute], async () => {
  commitSeriesTimeStep();
  if (groupTargetIds.value) {
    return;
  }
  if (attributeColorMap.value === undefined) {
    attributeColorMap.value = "batlow";
  }
  if (attributeNoDataColor.value === undefined) {
    attributeNoDataColor.value = DEFAULT_NO_DATA_COLOR;
  }
  const name = currentAttribute.value?.attribute_name;
  if (name === undefined) {
    return;
  }
  await loadRanges(name);
  if (name === currentAttribute.value?.attribute_name && attributeRange.value[0] === undefined) {
    applyRange();
  }
});
</script>

<template>
  <v-select
    data-testid="attributeSelector"
    v-model="attributeName"
    :items="attributes.map((attribute) => attribute.attribute_name)"
    item-title="attribute_name"
    item-value="attribute_name"
    density="compact"
    label="Select an attribute"
    hide-details
  />
  <v-select
    v-if="currentAttribute && currentAttribute.nb_items > 1"
    data-testid="itemSelector"
    v-model="attributeItem"
    :items="componentItems"
    item-title="title"
    item-value="value"
    density="compact"
    label="Select an item"
    class="mt-3"
    hide-details
  />
  <ViewerOptionsTimeStepSlider v-model="attributeTimeStep" :time-steps="timeSteps" />
  <div
    v-if="currentAttribute && noData"
    class="text-caption text-high-emphasis mt-1 d-flex align-center ga-1"
    data-testid="noDataInfo"
  >
    <v-icon icon="mdi-information-outline" size="14" color="info" />
    <span>Contains unmapped elements</span>
    <v-menu :close-on-content-click="false">
      <template #activator="{ props }">
        <button
          v-bind="props"
          type="button"
          class="color-picker-rect-btn ml-1"
          :style="{ backgroundColor: cssNoDataColor }"
          v-tooltip="'Change unmapped elements color'"
          data-testid="noDataColorBtn"
        />
      </template>
      <v-card class="pa-2">
        <ViewerOptionsColorPicker v-model="attributeNoDataColor" disabled-alpha />
      </v-card>
    </v-menu>
  </div>
  <ViewerOptionsAttributeColorBar
    v-if="attributeName"
    v-model:minimum="rangeMin"
    v-model:maximum="rangeMax"
    v-model:colorMap="attributeColorMap"
    :hide-range="groupTargetIds !== undefined"
    @reset="resetRange"
  />
</template>

<style scoped>
.color-picker-rect-btn {
  width: 26px;
  height: 15px;
  border-radius: 3px;
  border: 2px solid rgba(255, 255, 255, 0.912);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  outline: none;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}

.color-picker-rect-btn:hover {
  border-color: rgba(255, 255, 255, 0.9);
  transform: scale(1.1);
}
</style>
