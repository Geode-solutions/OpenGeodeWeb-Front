<script setup lang="ts">
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import type { MeshId } from "@ogw_front/types/identifiers";
import ViewerGenericMeshEdgesColoring from "@ogw_front/components/Viewer/Generic/Mesh/EdgesColoring.vue";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import ViewerOptionsWidthSlider from "@ogw_front/components/Viewer/Options/Sliders/Width.vue";
import type { Visibility } from "@ogw_front/types/style";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

interface CapabilityConfig {
  available?: boolean;
  hasColorMap?: boolean;
}

interface Props {
  itemProps: ItemProps & { index?: number };
  btnImage: string;
  tooltip?: string;
  capabilities?: Record<string, CapabilityConfig>;
}

const { itemProps, btnImage, tooltip = "Edges options", capabilities = {} } = defineProps<Props>();

const dataId = toRef(() => itemProps.id);

const visibility = computed<Visibility>({
  get: () => dataStyleStore.meshEdgesVisibility(dataId.value),
  set: async (newValue) => {
    await applyBatchStyle(dataId.value, (meshId: MeshId) =>
      dataStyleStore.setMeshEdgesVisibility(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const size = computed<number>({
  get: () => dataStyleStore.meshEdgesWidth(dataId.value),
  set: async (newValue) => {
    await applyBatchStyle(dataId.value, (meshId: MeshId) =>
      dataStyleStore.setMeshEdgesWidth(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="meshEdgesMenu"
    :index="itemProps.index!"
    :itemProps="itemProps"
    :tooltip="tooltip"
    :btnImage="btnImage"
  >
    <template #options>
      <v-row>
        <v-col>
          <ViewerOptionsVisibilitySwitch
            data-testid="meshEdgesVisibilitySwitch"
            v-model="visibility"
          />
        </v-col>
      </v-row>
      <template v-if="visibility">
        <v-divider class="my-2" />
        <ViewerOptionsWidthSlider data-testid="meshEdgesWidthSlider" v-model="size" />
        <ViewerGenericMeshEdgesColoring :data-id="dataId" :capabilities="capabilities" />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
