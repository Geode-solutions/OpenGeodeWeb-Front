<script setup>
import ViewerContextMenu from "@ogw_front/components/Viewer/ContextMenu";
import ViewerTreeObjectTree from "@ogw_front/components/Viewer/Tree/ObjectTree";
import { useDataStore } from "@ogw_front/stores/data";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const { id, displayMenu, menuStore, containerWidth, containerHeight, dataStyleStore, viewerStore } =
  defineProps({
    id: { type: String, required: true },
    displayMenu: { type: Boolean, required: true },
    menuStore: { type: Object, required: true },
    containerWidth: { type: Number, required: true },
    containerHeight: { type: Number, required: true },
    dataStyleStore: { type: Object, required: true },
    viewerStore: { type: Object, required: true },
  });

const emit = defineEmits(["show-menu", "set-id"]);

const dataStore = useDataStore();
const dataItems = dataStore.refAllItems();

async function get_viewer_id(x, y) {
  const activeIds = new Set(dataItems.value.map((item) => item.id));
  const ids = Object.keys(dataStyleStore.styles).filter((styleId) => activeIds.has(styleId));
  await viewerStore.request(
    viewer_schemas.opengeodeweb_viewer.viewer.picked_ids,
    { x, y, ids },
    {
      response_function: (response) => {
        const { array_ids } = response;
        const [first_id] = array_ids;
        emit("set-id", first_id);
      },
    },
  );
}

defineExpose({ get_viewer_id });
</script>

<template>
  <ViewerTreeObjectTree @show-menu="(args) => emit('show-menu', args)" />
  <ViewerContextMenu
    v-if="displayMenu"
    :id="menuStore.current_id || id"
    :x="menuStore.menuX"
    :y="menuStore.menuY"
    :container-width="containerWidth"
    :container-height="containerHeight"
  />
</template>
