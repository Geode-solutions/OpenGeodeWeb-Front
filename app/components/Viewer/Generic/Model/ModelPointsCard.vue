<script setup lang="ts">
import {
  type ModelMenuItemProps,
  useModelMenuContext,
} from "@ogw_front/composables/model_menu_context";
import ModelCardTabs from "./ModelCardTabs.vue";
import ViewerGenericModelComponentPointsOptions from "@ogw_front/components/Viewer/Generic/Model/ComponentPointsOptions.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useModelTabs } from "@ogw_front/composables/model_tabs";

// Corners have no points options: their points are the corners themselves
const POINTS_TYPE_TITLES = {
  Surface: "Surfaces Points Options",
  Line: "Lines Points Options",
  Block: "Blocks Points Options",
} as const;
type PointsComponentType = keyof typeof POINTS_TYPE_TITLES;
const POINTS_COMPONENT_TYPES: PointsComponentType[] = ["Surface", "Line", "Block"];

function isPointsComponentType(type: string | undefined): type is PointsComponentType {
  return type !== undefined && type in POINTS_TYPE_TITLES;
}

interface Props {
  itemProps: ModelMenuItemProps;
}

const { itemProps } = defineProps<Props>();

const dataStore = useDataStore();
const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

const { modelId, componentId, componentType, collections, targetComponentIds } =
  useModelMenuContext(() => itemProps);

const modelPointsVisibility = computed<boolean>({
  get: () => dataStyleStore.modelPointsVisibility(modelId.value),
  set: async (newValue) => {
    await applyBatchStyle(modelId.value, (targetId: string) =>
      dataStyleStore.setModelPointsVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});

const pointsComponentType = computed<PointsComponentType | undefined>(() =>
  isPointsComponentType(componentType.value) ? componentType.value : undefined,
);

const allComponentsTargets = ref<{ componentType: PointsComponentType; componentIds: string[] }[]>(
  [],
);
watch(
  modelId,
  async (currentModelId) => {
    const targets = await Promise.all(
      POINTS_COMPONENT_TYPES.map(async (type) => ({
        componentType: type,
        componentIds: await dataStore.getMeshComponentGeodeIds(currentModelId, type),
      })),
    );
    if (modelId.value === currentModelId) {
      allComponentsTargets.value = targets.filter((target) => target.componentIds.length > 0);
    }
  },
  { immediate: true },
);

const typeTargets = computed(() =>
  pointsComponentType.value === undefined
    ? []
    : [{ componentType: pointsComponentType.value, componentIds: targetComponentIds.value }],
);
const typeReferenceId = computed<string | undefined>(() =>
  collections.value ? targetComponentIds.value[0] : undefined,
);

const componentTargets = computed(() =>
  pointsComponentType.value === undefined || componentId.value === undefined
    ? []
    : [{ componentType: pointsComponentType.value, componentIds: [componentId.value] }],
);

const { tabs, activeTab } = useModelTabs({
  componentType,
  componentId,
  isTypeSupported: (type) => isPointsComponentType(type),
  hasComponentsOptions: computed(() => allComponentsTargets.value.length > 0),
});
</script>

<template>
  <v-sheet class="model-points-card" color="transparent">
    <ModelCardTabs v-model="activeTab" :tabs="tabs" />

    <div v-show="activeTab === 'model'">
      <VisibilitySwitch data-testid="modelPointsVisibilitySwitch" v-model="modelPointsVisibility" />
    </div>

    <div
      v-if="!componentType && !componentId && allComponentsTargets.length > 0"
      v-show="activeTab === 'components'"
      data-testid="modelPointsComponentsOptions"
    >
      <ViewerGenericModelComponentPointsOptions
        :modelId="modelId"
        :targets="allComponentsTargets"
      />
    </div>

    <div
      v-if="pointsComponentType"
      v-show="activeTab === 'type'"
      data-testid="modelPointsComponentTypeOptions"
    >
      <ViewerGenericModelComponentPointsOptions
        :modelId="modelId"
        :targets="typeTargets"
        :referenceComponentId="typeReferenceId"
      />
    </div>

    <div
      v-if="pointsComponentType && componentId"
      v-show="activeTab === 'component'"
      data-testid="modelPointsComponentOptions"
    >
      <ViewerGenericModelComponentPointsOptions
        :modelId="modelId"
        :targets="componentTargets"
        :referenceComponentId="componentId"
      />
    </div>
  </v-sheet>
</template>

<style scoped>
.model-points-card {
  padding-top: 12px;
  overflow-x: hidden;
}
</style>
