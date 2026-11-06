<script setup lang="ts">
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerGenericMeshPolygonsColoring from "@ogw_front/components/Viewer/Generic/Mesh/PolygonsColoring.vue";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface CapabilityConfig {
  available?: boolean;
  hasColorMap?: boolean;
}

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

interface Props {
  itemProps: ItemProps & { index?: number };
  btnImage: string;
  tooltip?: string;
  capabilities?: Record<string, CapabilityConfig>;
}

const {
  itemProps,
  btnImage,
  tooltip = "Polygons options",
  capabilities = {},
} = defineProps<Props>();

const dataId = toRef(() => itemProps.id);

const visibility = computed<boolean>({
  get: () => dataStyleStore.meshPolygonsVisibility(dataId.value),
  set: async (newValue) => {
    await applyBatchStyle(dataId.value, (targetId: string) =>
      dataStyleStore.setMeshPolygonsVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="meshPolygonsMenu"
    :index="itemProps.index!"
    :itemProps="itemProps"
    :tooltip="tooltip"
    :btnImage="btnImage"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch
        data-testid="meshPolygonsVisibilitySwitch"
        v-model="visibility"
      />
      <template v-if="visibility">
        <v-divider />
        <ViewerGenericMeshPolygonsColoring :data-id="dataId" :capabilities="capabilities" />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
