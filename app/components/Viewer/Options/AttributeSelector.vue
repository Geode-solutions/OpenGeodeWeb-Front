<script setup lang="ts">
import {
  type AttributeInfo,
  type AttributeRequestParams,
  attributeItemOptions,
  attributeRangesPerTarget,
  attributeRequestParams,
  useAttributeRangeBounds,
  useSeriesTimeStepCommit,
} from "@ogw_front/composables/attribute_selector";
import {
  type AttributeRangeInfo,
  type AttributeSchemas,
  fetchAttributeRange,
} from "@ogw_front/utils/attribute_range";
import { type RangesPerData, useBatchGroup } from "@ogw_front/composables/batch_style";
import { getAttributeRange, intersectAttributes } from "@ogw_front/utils/attributes";
import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
import ViewerOptionsAttributeColorBar from "@ogw_front/components/Viewer/Options/AttributeColorBar.vue";
import ViewerOptionsNoDataColorInfo from "@ogw_front/components/Viewer/Options/NoDataColorInfo.vue";
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
  schemas: AttributeSchemas;
}

const { id, componentIds = undefined, schemas } = defineProps<Props>();

interface Emits {
  "update:attributeColorMap": [colorMap: string];
  "update:attributeTimeStep": [timeStep: number];
  ranges_per_data: [ranges: RangesPerData];
}

const emit = defineEmits<Emits>();

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

const commitSeriesTimeStep = useSeriesTimeStepCommit(
  timeSteps,
  () => currentAttribute.value?.attribute_name,
  attributeTimeStep,
  () => {
    emit("update:attributeTimeStep", 0);
  },
);

const { rangeMin, rangeMax } = useAttributeRangeBounds(attributeRange);

const componentItems = computed<{ title: string; value: number }[]>(() => {
  if (currentAttribute.value) {
    return attributeItemOptions(currentAttribute.value.nb_items);
  }
  return [];
});

function requestParams(): AttributeRequestParams | undefined {
  return attributeRequestParams(schemas, id, componentIds);
}

function getRangeTargets(name: string): [string, AttributeRequestParams | undefined][] {
  if (groupTargetIds.value) {
    return [...attributesPerTarget]
      .filter(([, targetAttributes]) =>
        targetAttributes.some((attribute) => attribute.attribute_name === name),
      )
      .map(([targetId]) => [targetId, { id: targetId }]);
  }
  return [[id, requestParams()]];
}

// Ranges are computed by the back for the selected attribute only, as scanning every step of every series is slow
async function requestRanges(name: string): Promise<void> {
  const targets = getRangeTargets(name);
  const entries = await Promise.all(
    targets.map(async ([targetId, params]): Promise<[string, AttributeRangeInfo | undefined]> => {
      if (!params) {
        return [targetId, undefined];
      }
      return [targetId, await fetchAttributeRange(schemas.range, params, name)];
    }),
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
  const responses = await requestForTargets<{ attributes: AttributeInfo[] }>(
    schemas.names,
    targetIds,
    {
      attributes: [],
    },
  );
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
  emit("update:attributeColorMap", attributeColorMap.value ?? "batlow");
  emit("ranges_per_data", attributeRangesPerTarget(rangesPerTarget.value, item));
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
    { schema: schemas.names, params },
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
  [(): string => id, (): string[] | undefined => componentIds, (): AttributeSchemas => schemas],
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
  <ViewerOptionsNoDataColorInfo v-if="currentAttribute && noData" v-model="attributeNoDataColor" />
  <ViewerOptionsAttributeColorBar
    v-if="attributeName"
    v-model:minimum="rangeMin"
    v-model:maximum="rangeMax"
    v-model:colorMap="attributeColorMap"
    :hide-range="groupTargetIds !== undefined"
    @reset="resetRange"
  />
</template>
