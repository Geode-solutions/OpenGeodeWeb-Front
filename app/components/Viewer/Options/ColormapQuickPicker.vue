<script setup>
import ColorMapList from "@ogw_front/components/Viewer/Options/ColorMapList.vue";
import { getPresetsWithCurrentAtTop } from "@ogw_front/utils/colormap";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const { dataId, x, y } = defineProps({
  dataId: { required: false, type: String, default: undefined },
  x: { required: true, type: Number },
  y: { required: true, type: Number },
});

const show = defineModel("show", { type: Boolean, default: false });

const dataStyleStore = useDataStyleStore();
const hybridViewerStore = useHybridViewerStore();

const componentNames = [
  { getterKey: "meshPoints", setterKey: "MeshPoints", key: "points" },
  { getterKey: "meshEdges", setterKey: "MeshEdges", key: "edges" },
  { getterKey: "meshPolygons", setterKey: "MeshPolygons", key: "polygons" },
  { getterKey: "meshCells", setterKey: "MeshCells", key: "cells" },
  { getterKey: "meshPolyhedra", setterKey: "MeshPolyhedra", key: "polyhedra" },
];

const current = computed(() => {
  const targetId = dataId;
  if (!targetId) {
    return "batlow";
  }

  const style = dataStyleStore.getStyle(targetId);
  if (!style) {
    return "batlow";
  }

  for (const { key, getterKey } of componentNames) {
    if (!style[key] || !style[key].coloring) {
      continue;
    }

    const activeColoring = style[key].coloring.active;
    if (!["vertex", "edge", "polygon", "cell", "polyhedron"].includes(activeColoring)) {
      continue;
    }

    const attributeType = `${activeColoring.charAt(0).toUpperCase()}${activeColoring.slice(1)}Attribute`;
    const getterName = `${getterKey}${attributeType}ColorMap`;
    const getter = dataStyleStore[getterName];

    if (!getter) {
      continue;
    }

    const colorMap = getter(targetId);
    if (colorMap) {
      return colorMap;
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

  for (const { key, setterKey } of componentNames) {
    if (!style[key] || !style[key].coloring) {
      continue;
    }

    const activeColoring = style[key].coloring.active;
    if (!["vertex", "edge", "polygon", "cell", "polyhedron"].includes(activeColoring)) {
      continue;
    }

    const attributeType = `${activeColoring.charAt(0).toUpperCase() + activeColoring.slice(1)}Attribute`;
    const setterName = `set${setterKey}${attributeType}ColorMap`;
    const setter = dataStyleStore[setterName];

    if (setter) {
      promises.push(setter(targetId, newMap));
    }
  }

  await Promise.all(promises);

  hybridViewerStore.remoteRender();
}
</script>

<template>
  <v-menu
    v-model="show"
    :target="[x, y - 80]"
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
