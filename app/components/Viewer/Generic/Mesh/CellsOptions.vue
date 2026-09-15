<script setup lang="ts">
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

interface Texture {
  id: string;
  texture_name: string;
}

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

interface Props {
  itemProps: ItemProps & { index?: number };
  btnImage: string;
  tooltip?: string;
}

const { itemProps, btnImage, tooltip = "Cells options" } = defineProps<Props>();

const id = toRef(() => itemProps.id);

const visibility = computed<boolean>({
  get: () => dataStyleStore.meshCellsVisibility(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshCellsVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const coloring_style_key = computed<string>({
  get: () => dataStyleStore.meshCellsActiveColoring(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshCellsActiveColoring(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const color = computed<RGBAColor | undefined>({
  get: () => dataStyleStore.meshCellsColor(id.value) as RGBAColor | undefined,
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshCellsColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const textures = computed<Texture[] | undefined>({
  get: () =>
    dataStyleStore.meshCellsTextures(id.value) as Texture[] | undefined,
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshCellsTextures(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});

const vertex_attribute_name = computed<string | undefined>({
  get: () => dataStyleStore.meshCellsVertexAttributeName(id.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshCellsVertexAttributeName(targetId, newValue),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_item = computed<string | undefined>({
  get: () => dataStyleStore.meshCellsVertexAttributeItem(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshCellsVertexAttributeItem(targetId, newValue),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_range = computed<[number, number] | undefined>({
  get: () => dataStyleStore.meshCellsVertexAttributeRange(id.value),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshCellsVertexAttributeRange(
          targetId,
          minimum,
          maximum,
        ),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_color_map = computed<Map<string, RGBAColor>>({
  get: () => dataStyleStore.meshCellsVertexAttributeColorMap(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshCellsVertexAttributeColorMap(targetId, newValue),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_no_data_color = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.meshCellsVertexAttributeNoDataColor(id.value) as
      | RGBAColor
      | undefined,
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshCellsVertexAttributeNoDataColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const cell_attribute_name = computed<string | undefined>({
  get: () => dataStyleStore.meshCellsCellAttributeName(id.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshCellsCellAttributeName(targetId, newValue),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const cell_attribute_item = computed<string | undefined>({
  get: () => dataStyleStore.meshCellsCellAttributeItem(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshCellsCellAttributeItem(targetId, newValue),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const cell_attribute_range = computed<[number, number] | undefined>({
  get: () => dataStyleStore.meshCellsCellAttributeRange(id.value),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshCellsCellAttributeRange(
          targetId,
          minimum,
          maximum,
        ),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const cell_attribute_color_map = computed<Map<string, RGBAColor>>({
  get: () => dataStyleStore.meshCellsCellAttributeColorMap(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshCellsCellAttributeColorMap(targetId, newValue),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const cell_attribute_no_data_color = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.meshCellsCellAttributeNoDataColor(id.value) as
      | RGBAColor
      | undefined,
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshCellsCellAttributeNoDataColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
</script>

<template>
  <ViewerContextMenuItem
    data-testid="meshCellsMenu"
    :index="itemProps.index!"
    :itemProps="itemProps"
    :tooltip="tooltip"
    :btnImage="btnImage"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch
        data-testid="meshCellsVisibilitySwitch"
        v-model="visibility"
      />
      <template v-if="visibility">
        <v-divider />
        <ViewerOptionsColoringTypeSelector
          :id="id"
          v-model:coloring_style_key="coloring_style_key"
          v-model:color="color"
          v-model:textures="textures"
          v-model:vertex_attribute_name="vertex_attribute_name"
          v-model:vertex_attribute_item="vertex_attribute_item"
          v-model:vertex_attribute_range="vertex_attribute_range"
          v-model:vertex_attribute_color_map="vertex_attribute_color_map"
          v-model:vertex_attribute_no_data_color="
            vertex_attribute_no_data_color
          "
          v-model:cell_attribute_name="cell_attribute_name"
          v-model:cell_attribute_item="cell_attribute_item"
          v-model:cell_attribute_range="cell_attribute_range"
          v-model:cell_attribute_color_map="cell_attribute_color_map"
          v-model:cell_attribute_no_data_color="cell_attribute_no_data_color"
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
