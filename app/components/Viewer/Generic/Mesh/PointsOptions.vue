<script setup lang="ts">
import type {
  AttributeColorMap,
  AttributeRange,
  AttributeTimeStep,
  ColoringType,
} from "@ogw_front/types/attribute";
import type {
  AttributeItem,
  AttributeName,
  ColorRGBA,
  Opacity,
  PointSize,
  Visibility,
} from "@geode/opengeodeweb-viewer/schema_types";
import type { ImageSource, MenuItemIndex, Tooltip } from "@ogw_front/types/ui";
import {
  type RangesPerData,
  applyRangesPerData,
  useBatchStyle,
} from "@ogw_front/composables/batch_style";
import type { MeshId } from "@ogw_front/types/identifiers";
import ViewerContextMenuItem from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import ViewerOptionsSizeSlider from "@ogw_front/components/Viewer/Options/Sliders/Size.vue";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface Props {
  dataId: MeshId;
  index: MenuItemIndex;
  btnImage: ImageSource;
  tooltip?: Tooltip;
}

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

const { dataId, index, btnImage, tooltip = "Points options" } = defineProps<Props>();

const visibility = computed<Visibility>({
  get: () => dataStyleStore.meshPointsVisibility(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshPointsVisibility(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const size = computed<PointSize>({
  get: () => dataStyleStore.meshPointsSize(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshPointsSize(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const coloringStyleKey = computed<ColoringType>({
  get: () => dataStyleStore.meshPointsActiveColoring(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshPointsActiveColoring(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const color = computed<ColorRGBA | undefined>({
  get: () => dataStyleStore.meshPointsColor(dataId) as ColorRGBA | undefined,
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshPointsColor(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const opacity = computed<Opacity | undefined>({
  get: () => dataStyleStore.meshPointsOpacity(dataId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      dataStyleStore.setMeshPointsOpacity(meshId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_name = computed<AttributeName | undefined>({
  get: () => dataStyleStore.meshPointsVertexAttributeName(dataId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshPointsVertexAttributeName(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});

const vertex_attribute_time_step = computed<AttributeTimeStep | undefined>({
  get: () => dataStyleStore.meshPointsVertexAttributeTimeStep(dataId),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshPointsVertexAttributeTimeStep(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_item = computed<AttributeItem>({
  get: () => dataStyleStore.meshPointsVertexAttributeItem(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshPointsVertexAttributeItem(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_range = computed<AttributeRange>({
  get: () => dataStyleStore.meshPointsVertexAttributeRange(dataId),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshPointsVertexAttributeRange(meshId, minimum, maximum)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_color_map = computed<AttributeColorMap | undefined, AttributeColorMap>({
  get: () => dataStyleStore.meshPointsVertexAttributeColorMap(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
      Promise.resolve(dataStyleStore.setMeshPointsVertexAttributeColorMap(meshId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_no_data_color = computed<ColorRGBA>({
  get: () => dataStyleStore.meshPointsVertexAttributeNoDataColor(dataId),
  set: async (newValue) => {
    await applyBatchStyle(dataId, (meshId: MeshId) =>
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
    :index="index"
    :tooltip="tooltip"
    :btnImage="btnImage"
  >
    <template #options>
      <v-row class="pa-1">
        <v-col>
          <ViewerOptionsVisibilitySwitch
            data-testid="meshPointsVisibilitySwitch"
            v-model="visibility"
          />
        </v-col>
      </v-row>
      <template v-if="visibility">
        <v-divider class="my-2" />
        <ViewerOptionsSizeSlider data-testid="meshPointsSizeSlider" v-model="size" />
        <ViewerOptionsColoringTypeSelector
          :data-id="dataId"
          v-model:coloring_style_key="coloringStyleKey"
          v-model:color="color"
          v-model:opacity="opacity"
          v-model:vertex_attribute_name="vertex_attribute_name"
          v-model:vertex_attribute_item="vertex_attribute_item"
          v-model:vertex_attribute_range="vertex_attribute_range"
          @vertex_attribute_ranges_per_data="setVertexAttributeRangesPerData"
          v-model:vertex_attribute_color_map="vertex_attribute_color_map"
          v-model:vertex_attribute_no_data_color="vertex_attribute_no_data_color"
          v-model:vertex_attribute_time_step="vertex_attribute_time_step"
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
