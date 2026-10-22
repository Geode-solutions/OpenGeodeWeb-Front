<script setup lang="ts">
import {
  type ModelMenuItemProps,
  useModelMenuContext,
} from "@ogw_front/composables/model_menu_context";
import OptionsSection from "@ogw_front/components/Viewer/Options/OptionsSection.vue";
import ViewerGenericModelComponentEdgesOptions from "@ogw_front/components/Viewer/Generic/Model/ComponentEdgesOptions.vue";
import ViewerOptionsWidthSlider from "@ogw_front/components/Viewer/Options/Sliders/Width.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStore } from "@ogw_front/stores/data";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

// Lines are edges themselves and corners have none: no edges options for them
const EDGES_TYPE_TITLES = {
  Surface: "Surfaces Edges Options",
  Block: "Blocks Edges Options",
} as const;
type EdgesComponentType = keyof typeof EDGES_TYPE_TITLES;
const EDGES_COMPONENT_TYPES: EdgesComponentType[] = ["Surface", "Block"];

function isEdgesComponentType(type: string | undefined): type is EdgesComponentType {
  return type !== undefined && type in EDGES_TYPE_TITLES;
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

const modelEdgesVisibility = computed<boolean | undefined>({
  get: () => dataStyleStore.modelEdgesVisibility(modelId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(modelId.value, (targetId: string) =>
      dataStyleStore.setModelEdgesVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});

const modelEdgesWidth = computed<number | undefined>({
  get: () => dataStyleStore.modelEdgesWidth(modelId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(modelId.value, (targetId: string) =>
      dataStyleStore.setModelEdgesWidth(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});

const edgesComponentType = computed<EdgesComponentType | undefined>(() =>
  isEdgesComponentType(componentType.value) ? componentType.value : undefined,
);

const allComponentsTargets = ref<{ componentType: EdgesComponentType; componentIds: string[] }[]>(
  [],
);
watch(
  modelId,
  async (currentModelId) => {
    const targets = await Promise.all(
      EDGES_COMPONENT_TYPES.map(async (type) => ({
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
  edgesComponentType.value === undefined
    ? []
    : [{ componentType: edgesComponentType.value, componentIds: targetComponentIds.value }],
);
const typeReferenceId = computed<string | undefined>(() =>
  collections.value ? targetComponentIds.value[0] : undefined,
);

const componentTargets = computed(() =>
  edgesComponentType.value === undefined || componentId.value === undefined
    ? []
    : [{ componentType: edgesComponentType.value, componentIds: [componentId.value] }],
);
</script>

<template>
  <v-sheet class="model-edges-card" color="transparent">
    <OptionsSection title="Model Edges Options">
      <VisibilitySwitch data-testid="modelEdgesVisibilitySwitch" v-model="modelEdgesVisibility" />
      <ViewerOptionsWidthSlider
        v-if="modelEdgesVisibility"
        data-testid="modelEdgesWidthSlider"
        v-model="modelEdgesWidth"
      />
    </OptionsSection>

    <OptionsSection
      v-if="!componentType && !componentId && allComponentsTargets.length > 0"
      title="Components Edges Options"
      data-testid="modelEdgesComponentsOptions"
      class="mt-4"
    >
      <ViewerGenericModelComponentEdgesOptions :modelId="modelId" :targets="allComponentsTargets" />
    </OptionsSection>

    <OptionsSection
      v-if="edgesComponentType"
      :title="EDGES_TYPE_TITLES[edgesComponentType]"
      data-testid="modelEdgesComponentTypeOptions"
      class="mt-4"
    >
      <ViewerGenericModelComponentEdgesOptions
        :modelId="modelId"
        :targets="typeTargets"
        :referenceComponentId="typeReferenceId"
      />
    </OptionsSection>

    <OptionsSection
      v-if="edgesComponentType && componentId"
      title="Component Edges Options"
      data-testid="modelEdgesComponentOptions"
      class="mt-4"
    >
      <ViewerGenericModelComponentEdgesOptions
        :modelId="modelId"
        :targets="componentTargets"
        :referenceComponentId="componentId"
      />
    </OptionsSection>
  </v-sheet>
</template>

<style scoped>
.model-edges-card {
  padding-top: 12px;
  overflow-x: hidden;
}
</style>
