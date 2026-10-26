<script setup lang="ts">
import {
  type ModelMenuItemProps,
  useModelMenuContext,
} from "@ogw_front/composables/model_menu_context";
import BlocksOptions from "./BlocksOptions.vue";
import CornersOptions from "./CornersOptions.vue";
import LinesOptions from "./LinesOptions.vue";
import ModelCardTabs from "./ModelCardTabs.vue";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import SurfacesOptions from "./SurfacesOptions.vue";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import VisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useModelTabs } from "@ogw_front/composables/model_tabs";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

interface Props {
  itemProps: ModelMenuItemProps;
}

const { itemProps } = defineProps<Props>();

const { modelId, componentId, componentType, collections, targetComponentIds } =
  useModelMenuContext(() => itemProps);

const { tabs, activeTab } = useModelTabs({
  componentType,
  componentId,
});
function visibleComponents(targetId: string): string[] {
  return dataStyleStore.visibleMeshComponents(targetId).value || [];
}

const modelVisibility = computed<boolean | undefined>({
  get: () => dataStyleStore.modelVisibility(modelId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(modelId.value, (targetId: string) =>
      dataStyleStore.setModelVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});

const modelComponentsColor = computed<RGBAColor | undefined>({
  get: () => dataStyleStore.getModelColor(modelId.value) as RGBAColor | undefined,
  set: async (color) => {
    await applyBatchStyle(modelId.value, async (targetId: string) => {
      await dataStyleStore.mutateStyle(targetId, {
        coloring: { constant: color },
      });
      const activeColoring = dataStyleStore.getModelActiveColoring(targetId);
      await dataStyleStore.setModelComponentsColor(
        targetId,
        visibleComponents(targetId),
        color,
        typeof activeColoring === "string" ? activeColoring : undefined,
      );
    });
    hybridViewerStore.remoteRender();
  },
});

const modelComponentsActiveColoring = computed<string | undefined>({
  get: () => dataStyleStore.getModelActiveColoring(modelId.value) as string | undefined,
  set: async (coloringType) => {
    if (typeof coloringType !== "string") {
      return;
    }
    await applyBatchStyle(modelId.value, async (targetId: string) => {
      await dataStyleStore.mutateStyle(targetId, {
        coloring: { active: coloringType },
      });
      await dataStyleStore.setModelComponentsColor(
        targetId,
        visibleComponents(targetId),
        dataStyleStore.getModelColor(targetId),
        coloringType,
      );
    });
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <v-sheet class="model-style-card" color="transparent">
    <ModelCardTabs v-model="activeTab" :tabs="tabs" />

    <div v-show="activeTab === 'model'">
      <VisibilitySwitch data-testid="modelStyleVisibilitySwitch" v-model="modelVisibility" />
    </div>

    <div v-if="!componentType && !componentId" v-show="activeTab === 'components'">
      <ViewerOptionsColoringTypeSelector
        :id="modelId"
        v-model:coloring_style_key="modelComponentsActiveColoring"
        v-model:color="modelComponentsColor"
        :capabilities="{ color: { available: true } }"
        :allowRandom="true"
      />
    </div>

    <BlocksOptions
      v-if="componentType === 'Block'"
      :modelId="modelId"
      :blockId="componentId"
      :targetBlockIds="targetComponentIds"
      :collections="collections"
      :activeTab="activeTab"
    />
    <SurfacesOptions
      v-else-if="componentType === 'Surface'"
      :modelId="modelId"
      :surfaceId="componentId"
      :targetSurfaceIds="targetComponentIds"
      :collections="collections"
      :activeTab="activeTab"
    />
    <LinesOptions
      v-else-if="componentType === 'Line'"
      :modelId="modelId"
      :lineId="componentId"
      :targetLineIds="targetComponentIds"
      :collections="collections"
      :activeTab="activeTab"
    />
    <CornersOptions
      v-else-if="componentType === 'Corner'"
      :modelId="modelId"
      :cornerId="componentId"
      :targetCornerIds="targetComponentIds"
      :collections="collections"
      :activeTab="activeTab"
    />
  </v-sheet>
</template>

<style scoped>
.model-style-card {
  padding-top: 12px;
  overflow-x: hidden;
}

:deep(.v-field) {
  min-height: 30px !important;
  height: 30px !important;
  border-radius: 6px !important;
}

:deep(.v-field__input) {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  min-height: 30px !important;
  height: 30px !important;
  font-size: 0.95rem !important;
  align-items: center;
}

:deep(.v-field__append-inner) {
  align-items: center;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  height: 30px !important;
}

:deep(.v-field__append-inner .v-icon) {
  font-size: 16px !important;
}

:deep(.v-field-label) {
  font-size: 0.75rem !important;
  top: 6px !important;
}

:deep(.v-field-label--floating) {
  top: -8px !important;
  font-size: 0.7rem !important;
}
</style>
