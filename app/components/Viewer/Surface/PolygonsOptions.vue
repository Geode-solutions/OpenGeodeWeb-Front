<script setup lang="ts">
import ViewerContextMenuItem, {
  type ItemProps,
} from "@ogw_front/components/Viewer/ContextMenu/ContextMenuItem.vue";
import PolygonalSurfacePolygons from "@ogw_front/assets/viewer_svgs/surface_triangles.svg";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import ViewerOptionsColoringTypeSelector from "@ogw_front/components/Viewer/Options/ColoringTypeSelector.vue";
import ViewerOptionsVisibilitySwitch from "@ogw_front/components/Viewer/Options/VisibilitySwitch.vue";
import { useBatchStyle } from "@ogw_front/composables/batch_style";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();
const { applyBatchStyle } = useBatchStyle();

interface Texture {
  id: string;
  texture_name: string;
}

interface Props {
  itemProps: ItemProps & { index: number };
  tooltip?: string;
}

const { itemProps, tooltip = "Polygons options" } = defineProps<Props>();

const id = toRef(() => itemProps.id);

const visibility = computed<boolean>({
  get: () => dataStyleStore.meshPolygonsVisibility(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPolygonsVisibility(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const coloring_style_key = computed<string>({
  get: () => dataStyleStore.meshPolygonsActiveColoring(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPolygonsActiveColoring(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const color = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.meshPolygonsColor(id.value) as RGBAColor | undefined,
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPolygonsColor(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const textures = computed<Texture[] | undefined>({
  get: () =>
    dataStyleStore.meshPolygonsTextures(id.value) as Texture[] | undefined,
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPolygonsTextures(targetId, newValue),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_name = computed<string | undefined>({
  get: () => dataStyleStore.meshPolygonsVertexAttributeName(id.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPolygonsVertexAttributeName(targetId, newValue),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_item = computed<string | undefined>({
  get: () => dataStyleStore.meshPolygonsVertexAttributeItem(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPolygonsVertexAttributeItem(targetId, newValue),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_range = computed<[number, number] | undefined>({
  get: () => dataStyleStore.meshPolygonsVertexAttributeRange(id.value),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPolygonsVertexAttributeRange(
          targetId,
          minimum,
          maximum,
        ),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const vertex_attribute_color_map = computed<Map<string, RGBAColor> | undefined>(
  {
    get: () => dataStyleStore.meshPolygonsVertexAttributeColorMap(id.value),
    set: async (newValue) => {
      await applyBatchStyle(id.value, (targetId: string) =>
        Promise.resolve(
          dataStyleStore.setMeshPolygonsVertexAttributeColorMap(
            targetId,
            newValue,
          ),
        ),
      );
      hybridViewerStore.remoteRender();
    },
  },
);
const vertex_attribute_no_data_color = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.meshPolygonsVertexAttributeNoDataColor(id.value) as
      | RGBAColor
      | undefined,
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPolygonsVertexAttributeNoDataColor(
        targetId,
        newValue,
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const polygon_attribute_name = computed<string | undefined>({
  get: () => dataStyleStore.meshPolygonsPolygonAttributeName(id.value),
  set: async (newValue) => {
    if (newValue === undefined) {
      return;
    }
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPolygonsPolygonAttributeName(targetId, newValue),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const polygon_attribute_item = computed<string | undefined>({
  get: () => dataStyleStore.meshPolygonsPolygonAttributeItem(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPolygonsPolygonAttributeItem(targetId, newValue),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const polygon_attribute_range = computed<[number, number] | undefined>({
  get: () => dataStyleStore.meshPolygonsPolygonAttributeRange(id.value),
  set: async (newValue) => {
    const [minimum, maximum] = newValue;
    if (minimum === undefined || maximum === undefined) {
      return;
    }
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPolygonsPolygonAttributeRange(
          targetId,
          minimum,
          maximum,
        ),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const polygon_attribute_color_map = computed<
  Map<string, RGBAColor> | undefined
>({
  get: () => dataStyleStore.meshPolygonsPolygonAttributeColorMap(id.value),
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      Promise.resolve(
        dataStyleStore.setMeshPolygonsPolygonAttributeColorMap(
          targetId,
          newValue,
        ),
      ),
    );
    hybridViewerStore.remoteRender();
  },
});
const polygon_attribute_no_data_color = computed<RGBAColor | undefined>({
  get: () =>
    dataStyleStore.meshPolygonsPolygonAttributeNoDataColor(id.value) as
      | RGBAColor
      | undefined,
  set: async (newValue) => {
    await applyBatchStyle(id.value, (targetId: string) =>
      dataStyleStore.setMeshPolygonsPolygonAttributeNoDataColor(
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
    data-testid="meshPolygonsMenu"
    :index="itemProps.index"
    :itemProps="itemProps"
    :tooltip="tooltip"
    :btnImage="PolygonalSurfacePolygons"
  >
    <template #options>
      <ViewerOptionsVisibilitySwitch
        data-testid="meshPolygonsVisibilitySwitch"
        v-model="visibility"
      />
      <template v-if="visibility">
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
          v-model:polygon_attribute_name="polygon_attribute_name"
          v-model:polygon_attribute_item="polygon_attribute_item"
          v-model:polygon_attribute_range="polygon_attribute_range"
          v-model:polygon_attribute_color_map="polygon_attribute_color_map"
          v-model:polygon_attribute_no_data_color="
            polygon_attribute_no_data_color
          "
        />
      </template>
    </template>
  </ViewerContextMenuItem>
</template>
