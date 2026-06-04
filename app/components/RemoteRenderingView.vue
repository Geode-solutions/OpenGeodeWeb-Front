<script setup>
import { useElementSize, useWindowSize } from "@vueuse/core";

import { Status } from "@ogw_front/utils/status";
import { useDataStore } from "@ogw_front/stores/data";
import { useMenuStore } from "@ogw_front/stores/menu";
import { useQuickColormap } from "@ogw_front/composables/use_quick_colormap";
import { useViewerStore } from "@ogw_front/stores/viewer";

import ColormapQuickPicker from "@ogw_front/components/Viewer/Options/ColormapQuickPicker.vue";
import ViewToolbar from "@ogw_front/components/ViewToolbar";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";
import vtkRemoteView from "@kitware/vtk.js/Rendering/Misc/RemoteView";

const { viewId } = defineProps({
  viewId: { type: String, default: "-1" },
});

const viewerStore = useViewerStore();
const menuStore = useMenuStore();
const dataStore = useDataStore();
const viewer = useTemplateRef("viewer");
const { width, height } = useElementSize(viewer);

const { width: windowWidth, height: windowHeight } = useWindowSize();

const { pickColormap, quickColormap } = useQuickColormap();

async function get_x_y(event) {
  const { offsetX, offsetY, clientX, clientY } = event;
  if (viewerStore.picking_mode === true) {
    viewerStore.set_picked_point(offsetX, offsetY);
    const schema = viewer_schemas.opengeodeweb_viewer.viewer.get_point_position;
    const params = { x: offsetX, y: offsetY };
    viewerStore.request({ schema, params });
  } else {
    await pickColormap(offsetX, offsetY, clientX, clientY);
  }
}

const connected = ref(false);
// oxlint-disable-next-line import/no-named-as-default-member
const view = vtkRemoteView.newInstance({
  rpcWheelEvent: "viewport.mouse.zoom.wheel",
});

if (location.hostname.split(".")[0] === "localhost") {
  view.setInteractiveRatio(1);
}

function resize() {
  if (view) {
    view.getCanvasView().setSize(0, 0);
    view.resize();
  }
}

watch([windowWidth, windowHeight], () => {
  resize();
});

watch(
  () => viewerStore.picking_mode,
  (value) => {
    const cursor = value ? "crosshair" : "pointer";
    view.getCanvasView().setCursor(cursor);
  },
);

watch([width, height], () => {
  resize();
});

watch(
  () => viewerStore.client,
  () => {
    connect();
  },
);

watch(
  () => props.viewId,
  (id) => {
    if (connected.value) {
      view.setViewId(id);
      view.render();
    }
  },
);

function connect() {
  if (viewerStore.status !== Status.CONNECTED) {
    return;
  }
  const session = viewerStore.client.getConnection().getSession();
  view.setSession(session);
  view.setViewId(props.viewId);
  connected.value = true;
  view.render();
}

onMounted(async () => {
  if (import.meta.client) {
    window.addEventListener("resize", resize);
    await nextTick();
    view.setContainer(viewer.value.$el);
    connect();
    resize();
  }
});
</script>

<template>
  <ClientOnly>
    <div style="position: relative; width: 100%; height: 100%">
      <ColormapQuickPicker
        v-model:show="quickColormap.show"
        :x="quickColormap.x"
        :y="quickColormap.y"
        :data-id="quickColormap.data_id"
      />
      <ViewToolbar />
      <slot name="ui"></slot>
      <v-col
        ref="viewer"
        style="overflow: hidden; position: relative; height: 100%; width: 100%"
        z-index="0"
        class="pa-0"
        @pointerup.capture="get_x_y"
        @keydown.esc="viewerStore.toggle_picking_mode(false)"
      />
    </div>
  </ClientOnly>
</template>

<style scoped>
.list {
  position: absolute;
  z-index: 1;
  left: 0;
  top: 0;
  background-color: transparent;
  border-radius: 16px;
}

:deep(img) {
  -webkit-user-drag: none;
  -khtml-user-drag: none;
  -moz-user-drag: none;
  -o-user-drag: none;
  user-drag: none;
  user-select: none;
  -moz-user-select: none;
  -webkit-user-select: none;
  -ms-user-select: none;
}
</style>
