<script setup>
import ColorMapList from "@ogw_front/components/Viewer/Options/ColorMapList.vue";
import { colormaps } from "@ogw_front/utils/colormap";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const { dataId, x, y } = defineProps({
  dataId: { required: false, type: String },
  x: { required: true, type: Number },
  y: { required: true, type: Number },
});

const show = defineModel("show", { type: Boolean, default: false });

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const current = ref("batlow");

const quickColormapPresets = computed(() => {
  let currentPreset = undefined;
  for (const category of colormaps) {
    currentPreset = category.Children.find(
      (preset) => preset.Name === current.value,
    );
    if (currentPreset) {
      break;
    }
  }
  return [currentPreset, ...colormaps].filter(Boolean);
});

async function onQuickColormapSelect(preset) {
  show.value = false;
  const newMap = preset.Name;
  const targetId = dataId;
  if (!targetId) {
    return;
  }

  async function trySet(setterFunction) {
    await setterFunction?.(targetId, newMap);
  }

  await Promise.all([
    trySet(dataStyleStore.setMeshPolygonsVertexAttributeColorMap),
    trySet(dataStyleStore.setMeshPolygonsPolygonAttributeColorMap),
    trySet(dataStyleStore.setMeshPointsVertexAttributeColorMap),
    trySet(dataStyleStore.setMeshEdgesVertexAttributeColorMap),
    trySet(dataStyleStore.setMeshEdgesEdgeAttributeColorMap),
    trySet(dataStyleStore.setMeshCellsVertexAttributeColorMap),
    trySet(dataStyleStore.setMeshCellsCellAttributeColorMap),
    trySet(dataStyleStore.setMeshPolyhedraVertexAttributeColorMap),
    trySet(dataStyleStore.setMeshPolyhedraPolyhedronAttributeColorMap),
  ]);

  hybridViewerStore.remoteRender();
}
</script>

<template>
  <div
    style="position: absolute; width: 1px; height: 1px; pointer-events: none"
    :style="{ left: `${x}px`, top: `${y - 150}px` }"
    id="quickColormapActivator"
  ></div>
  <v-menu
    v-model="show"
    activator="#quickColormapActivator"
    location="top center"
    :close-on-content-click="false"
  >
    <ColorMapList
      :presets="quickColormapPresets"
      :selected-preset-name="current"
      @select="onQuickColormapSelect"
    />
  </v-menu>
</template>
