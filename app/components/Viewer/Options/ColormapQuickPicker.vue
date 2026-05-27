<script setup>
import ColorMapList from "@ogw_front/components/Viewer/Options/ColorMapList.vue";
import { getPresetsWithCurrentAtTop } from "@ogw_front/utils/colormap";
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

const current = computed(() => {
  const targetId = dataId;
  if (!targetId) {
    return "batlow";
  }

  const style = dataStyleStore.getStyle(targetId);
  if (!style) {
    return "batlow";
  }

  const componentNames = [
    { getterKey: "meshPoints", key: "points" },
    { getterKey: "meshEdges", key: "edges" },
    { getterKey: "meshPolygons", key: "polygons" },
    { getterKey: "meshCells", key: "cells" },
    { getterKey: "meshPolyhedra", key: "polyhedra" },
  ];

  for (const { key, getterKey } of componentNames) {
    const activeColoring = style[key]?.coloring?.active;
    if (["vertex", "edge", "polygon", "cell", "polyhedron"].includes(activeColoring)) {
      const attributeType = `${activeColoring.charAt(0).toUpperCase()}${activeColoring.slice(1)}Attribute`;
      const getterName = `${getterKey}${attributeType}ColorMap`;
      const getter = dataStyleStore[getterName];
      if (getter) {
        const colorMap = getter(targetId);
        if (colorMap) {
          return colorMap;
        }
      }
    }
  }

  return "batlow";
});

const quickColormapPresets = computed(() => getPresetsWithCurrentAtTop(current.value));

async function onQuickColormapSelect(preset) {
  show.value = false;
  const newMap = preset.Name;
  const targetId = dataId;
  if (!targetId) {
    return;
  }

  const style = dataStyleStore.getStyle(targetId);
  if (!style) {
    return;
  }

  const promises = [];
  const componentNames = [
    { key: "points", setterKey: "MeshPoints" },
    { key: "edges", setterKey: "MeshEdges" },
    { key: "polygons", setterKey: "MeshPolygons" },
    { key: "cells", setterKey: "MeshCells" },
    { key: "polyhedra", setterKey: "MeshPolyhedra" },
  ];

  for (const { key, setterKey } of componentNames) {
    const activeColoring = style[key]?.coloring?.active;
    if (["vertex", "edge", "polygon", "cell", "polyhedron"].includes(activeColoring)) {
      const attributeType = `${activeColoring.charAt(0).toUpperCase() + activeColoring.slice(1)}Attribute`;
      const setterName = `set${setterKey}${attributeType}ColorMap`;
      const setter = dataStyleStore[setterName];
      if (setter) {
        promises.push(setter(targetId, newMap));
      }
    }
  }

  await Promise.all(promises);

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
    eager
  >
    <ColorMapList
      :presets="quickColormapPresets"
      :selected-preset-name="current"
      @select="onQuickColormapSelect"
    />
  </v-menu>
</template>
