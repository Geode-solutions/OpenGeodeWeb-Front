<script setup lang="ts">
import {
  type ModelMenuItemProps,
  useModelMenuContext,
} from "@ogw_front/composables/model_menu_context";
import OptionsSection from "@ogw_front/components/Viewer/Options/OptionsSection.vue";
import ViewerGenericModelComponentPointsOptions from "@ogw_front/components/Viewer/Generic/Model/ComponentPointsOptions.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

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
</script>

<template>
  <v-sheet class="model-points-card" color="transparent">
    <OptionsSection title="Model Points Options">
      <VisibilitySwitch data-testid="modelPointsVisibilitySwitch" v-model="modelPointsVisibility" />
    </OptionsSection>

    <OptionsSection
      v-if="!componentType && !componentId && allComponentsTargets.length > 0"
      title="Components Points Options"
      class="mt-4"
    >
      <ViewerGenericModelComponentPointsOptions
        :modelId="modelId"
        :targets="allComponentsTargets"
      />
    </OptionsSection>

    <OptionsSection
      v-if="pointsComponentType"
      :title="POINTS_TYPE_TITLES[pointsComponentType]"
      class="mt-4"
    >
      <ViewerGenericModelComponentPointsOptions
        :modelId="modelId"
        :targets="typeTargets"
        :referenceComponentId="typeReferenceId"
      />
    </OptionsSection>

    <OptionsSection
      v-if="pointsComponentType && componentId"
      title="Component Points Options"
      class="mt-4"
    >
      <ViewerGenericModelComponentPointsOptions
        :modelId="modelId"
        :targets="componentTargets"
        :referenceComponentId="componentId"
      />
    </OptionsSection>
  </v-sheet>
</template>

<style scoped>
.model-points-card {
  padding-top: 12px;
  overflow-x: hidden;
}
</style>
