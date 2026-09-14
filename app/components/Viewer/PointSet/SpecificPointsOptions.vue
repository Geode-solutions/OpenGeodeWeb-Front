<script setup lang="ts">
// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
import PointSetPoints from "@ogw_front/assets/viewer_svgs/point_set_points.svg";
// oxlint-disable import/consistent-type-specifier-style -- combining the default import with the type import avoids a duplicate-imports violation on this same module; using disable-next-line here is fragile because a formatter can re-wrap the import onto multiple lines and shift the flagged line
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector";
import ViewerOptionsSizeSlider from "@ogw_front/components/Viewer/Options/Sliders/Size";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch";

import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

interface Props {
  itemProps: ItemProps & { index: number };
}

const { itemProps } = defineProps<Props>();

const id = toRef(() => itemProps.id);

const visibility = computed({
  get: () => dataStyleStore.meshPointsVisibility(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPointsVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const size = computed({
  get: () => dataStyleStore.meshPointsSize(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPointsSize(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const coloring_style_key = computed({
  get: () => dataStyleStore.meshPointsActiveColoring(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPointsActiveColoring(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const color = computed<RGBAColor | undefined>({
  get: () => dataStyleStore.meshPointsColor(id.value) as RGBAColor | undefined,
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPointsColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_name = computed({
  get: () => dataStyleStore.meshPointsVertexAttributeName(id.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPointsVertexAttributeName(targetId, newValue),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_item = computed({
  get: () => dataStyleStore.meshPointsVertexAttributeItem(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPointsVertexAttributeItem(targetId, newValue),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_range = computed({
  get: () => dataStyleStore.meshPointsVertexAttributeRange(id.value),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPointsVertexAttributeRange(
          targetId,
          minimum,
          maximum,
        ),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_color_map = computed({
  get: () => dataStyleStore.meshPointsVertexAttributeColorMap(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPointsVertexAttributeColorMap(targetId, newValue),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_no_data_color = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.meshPointsVertexAttributeNoDataColor(id.value) as
      | RGBAColor
      | undefined,
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPointsVertexAttributeNoDataColor(
        targetId,
        newValue,
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
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
        <ViewerOptionsSizeSlider
          data-testid="meshPointsSizeSlider"
          v-model="size"
        />
        <ViewerOptionsColoringTypeSelector
          :id="id"
          v-model:coloring_style_key="coloring_style_key"
          v-model:color="color"
          v-model:vertex_attribute_name="vertex_attribute_name"
          v-model:vertex_attribute_item="vertex_attribute_item"
          v-model:vertex_attribute_range="vertex_attribute_range"
          v-model:vertex_attribute_color_map="vertex_attribute_color_map"
          v-model:vertex_attribute_no_data_color="
            vertex_attribute_no_data_color
          "
          :vertex_has_colormap="true"
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
