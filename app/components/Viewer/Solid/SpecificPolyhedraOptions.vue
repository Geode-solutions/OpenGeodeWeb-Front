<script setup lang="ts">
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import SolidPolyhedra from "@ogw_front/assets/viewer_svgs/solid_polyhedra.svg";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

interface Props {
  itemProps: ItemProps & { index: number };
  tooltip?: string;
}

const { itemProps, tooltip = "Polyhedra options" } = defineProps<Props>();

const id = toRef(() => itemProps.id);

const visibility = computed<boolean>({
  get: () => dataStyleStore.meshPolyhedraVisibility(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPolyhedraVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const coloring_style_key = computed<string>({
  get: () => dataStyleStore.meshPolyhedraActiveColoring(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPolyhedraActiveColoring(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const color = computed<RGBAColor | undefined>({
  get: () => dataStyleStore.meshPolyhedraColor(id.value) as RGBAColor | undefined,
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPolyhedraColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_name = computed<string | undefined>({
  get: () => dataStyleStore.meshPolyhedraVertexAttributeName(id.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolyhedraVertexAttributeName(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_item = computed<string | undefined>({
  get: () => dataStyleStore.meshPolyhedraVertexAttributeItem(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolyhedraVertexAttributeItem(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_range = computed<[number, number] | undefined>({
  get: () => dataStyleStore.meshPolyhedraVertexAttributeRange(id.value),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPolyhedraVertexAttributeRange(targetId, minimum, maximum),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_color_map = computed<Map<string, RGBAColor> | undefined>({
  get: () => dataStyleStore.meshPolyhedraVertexAttributeColorMap(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolyhedraVertexAttributeColorMap(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_no_data_color = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.meshPolyhedraVertexAttributeNoDataColor(id.value) as RGBAColor | undefined,
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPolyhedraVertexAttributeNoDataColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const polyhedron_attribute_name = computed<string | undefined>({
  get: () => dataStyleStore.meshPolyhedraPolyhedronAttributeName(id.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolyhedraPolyhedronAttributeName(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const polyhedron_attribute_item = computed<string | undefined>({
  get: () => dataStyleStore.meshPolyhedraPolyhedronAttributeItem(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(dataStyleStore.setMeshPolyhedraPolyhedronAttributeItem(targetId, newValue)),
    );
    hybridViewerStore.remoteRender();
  },
});
const polyhedron_attribute_range = computed<[number, number] | undefined>({
  get: () => dataStyleStore.meshPolyhedraPolyhedronAttributeRange(id.value),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPolyhedraPolyhedronAttributeRange(targetId, minimum, maximum),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const polyhedron_attribute_color_map = computed<Map<string, RGBAColor> | undefined>({
  get: () => dataStyleStore.meshPolyhedraPolyhedronAttributeColorMap(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPolyhedraPolyhedronAttributeColorMap(targetId, newValue),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const polyhedron_attribute_no_data_color = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.meshPolyhedraPolyhedronAttributeNoDataColor(id.value) as RGBAColor | undefined,
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPolyhedraPolyhedronAttributeNoDataColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>
<template>
  <ViewerContextMenuItem
    data-testid="meshPolyhedraMenu"
    :index="itemProps.index"
    :itemProps="itemProps"
    :tooltip="tooltip"
    :btnImage="SolidPolyhedra"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch
        data-testid="meshPolyhedraVisibilitySwitch"
        v-model="visibility"
      />
      <template v-if="visibility">
        <ViewerOptionsColoringTypeSelector
          :id="id"
          v-model:coloring_style_key="coloring_style_key"
          v-model:color="color"
          v-model:vertex_attribute_name="vertex_attribute_name"
          v-model:vertex_attribute_item="vertex_attribute_item"
          v-model:vertex_attribute_range="vertex_attribute_range"
          v-model:vertex_attribute_color_map="vertex_attribute_color_map"
          v-model:vertex_attribute_no_data_color="vertex_attribute_no_data_color"
          v-model:polyhedron_attribute_name="polyhedron_attribute_name"
          v-model:polyhedron_attribute_item="polyhedron_attribute_item"
          v-model:polyhedron_attribute_range="polyhedron_attribute_range"
          v-model:polyhedron_attribute_color_map="polyhedron_attribute_color_map"
          v-model:polyhedron_attribute_no_data_color="polyhedron_attribute_no_data_color"
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
