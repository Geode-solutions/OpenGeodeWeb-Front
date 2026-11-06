<script setup lang="ts">
import {
  type RangesPerData,
  applyRangesPerData,
  useBatchStyle,
} from "@ogw_front/composables/batch_style";
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import type { MeshId } from "@ogw_front/types/identifiers";
import PointSetPoints from "@ogw_front/assets/viewer_svgs/point_set_points.svg";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import ViewerOptionsSizeSlider from "@ogw_front/components/Viewer/Options/Sliders/Size.vue";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

interface Props {
  itemProps: ItemProps & { index: number };
}

const { itemProps } = defineProps<Props>();

const dataId = toRef(() => itemProps.id);

const visibility = computed({
  get: () => dataStyleStore.meshPointsVisibility(dataId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId.value, (meshId: MeshId) =>
      dataStyleStore.setMeshPointsVisibility(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const size = computed({
  get: () => dataStyleStore.meshPointsSize(dataId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId.value, (meshId: MeshId) =>
      dataStyleStore.setMeshPointsSize(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const coloring_style_key = computed({
  get: () => dataStyleStore.meshPointsActiveColoring(dataId.value),
  set: async (newValue) => {
    await applyBatchStyle(dataId.value, (meshId: MeshId) =>
      dataStyleStore.setMeshPointsActiveColoring(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const color = computed<RGBAColor | undefined>({
  get: () => dataStyleStore.meshPointsColor(dataId.value) as RGBAColor | undefined,
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId.value, (meshId: MeshId) =>
      dataStyleStore.setMeshPointsColor(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const opacity = computed<number | undefined>({
  get: () => dataStyleStore.meshPointsOpacity(dataId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId.value, (meshId: MeshId) =>
      dataStyleStore.setMeshPointsOpacity(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_name = computed({
  get: () => dataStyleStore.meshPointsVertexAttributeName(dataId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId.value, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshPointsVertexAttributeName(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});

const vertex_attribute_time_step = computed({
  get: () => dataStyleStore.meshPointsVertexAttributeTimeStep(dataId.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId.value, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshPointsVertexAttributeTimeStep(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_item = computed({
  get: () => dataStyleStore.meshPointsVertexAttributeItem(dataId.value),
  set: async (newValue) => {
    await applyBatchStyle(dataId.value, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshPointsVertexAttributeItem(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_range = computed({
  get: () => dataStyleStore.meshPointsVertexAttributeRange(dataId.value),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(dataId.value, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshPointsVertexAttributeRange(meshId, minimum, maximum)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_color_map = computed({
  get: () => dataStyleStore.meshPointsVertexAttributeColorMap(dataId.value),
  set: async (newValue) => {
    await applyBatchStyle(dataId.value, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshPointsVertexAttributeColorMap(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_no_data_color = computed<RGBAColor>({
  get: () => dataStyleStore.meshPointsVertexAttributeNoDataColor(dataId.value),
  set: async (newValue) => {
    await applyBatchStyle(dataId.value, (meshId: MeshId) =>
      dataStyleStore.setMeshPointsVertexAttributeNoDataColor(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});

async function setVertexAttributeRangesPerData(ranges: RangesPerData): Promise<void> {
  await applyRangesPerData(ranges, (meshId, minimum, maximum) =>
    dataStyleStore.setMeshPointsVertexAttributeRange(meshId, minimum, maximum),
  );
  hybridViewerStore.remoteRender();
}
</script>
<template>
  <ViewerContextMenuItem
    data-testid="meshPointsMenu"
    :index="itemProps.index"
    :itemProps="itemProps"
    :btnImage="PointSetPoints"
    tooltip="Points options"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch
        data-testid="meshPointsVisibilitySwitch"
        v-model="visibility"
      />
      <template v-if="visibility">
        <v-divider class="my-2" />
        <ViewerOptionsSizeSlider data-testid="meshPointsSizeSlider" v-model="size" />
        <ViewerOptionsColoringTypeSelector
          :data-id="dataId"
          v-model:coloring_style_key="coloring_style_key"
          v-model:color="color"
          v-model:opacity="opacity"
          v-model:vertex_attribute_name="vertex_attribute_name"
          v-model:vertex_attribute_item="vertex_attribute_item"
          v-model:vertex_attribute_range="vertex_attribute_range"
          @vertex_attribute_ranges_per_data="setVertexAttributeRangesPerData"
          v-model:vertex_attribute_color_map="vertex_attribute_color_map"
          v-model:vertex_attribute_no_data_color="vertex_attribute_no_data_color"
          v-model:vertex_attribute_time_step="vertex_attribute_time_step"
          :vertex_has_colormap="true"
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
