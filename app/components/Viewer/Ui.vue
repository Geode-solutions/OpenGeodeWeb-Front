<script setup>
import ViewerContextMenu from "@ogw_front/components/Viewer/ContextMenu";
import ViewerTreeLayout from "@ogw_front/components/Viewer/ObjectTree/Layout";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const { displayMenu, containerWidth, containerHeight } = defineProps({
  displayMenu: { type: Boolean, required: true },
  containerWidth: { type: Number, required: true },
  containerHeight: { type: Number, required: true },
});

const emit = defineEmits(["show-menu"]);

const dataStore = useDataStore();
const dataStyleStore = useDataStyleStore();
const viewerStore = useViewerStore();
const menuStore = useMenuStore();
const dataItems = dataStore.refAllItems();

async function get_viewer_id(x, y) {
  const activeIds = new Set(dataItems.value.map((item) => item.id));
  const ids = Object.keys(dataStyleStore.styles).filter((styleId) =>
    activeIds.has(styleId),
  );

  let result = { id: undefined, viewer_id: undefined };
  await viewerStore.request(
    viewer_schemas.opengeodeweb_viewer.viewer.picked_ids,
    { x, y, ids },
    {
      response_function: (response) => {
        const { array_ids, viewer_id } = response;
        const [first_id] = array_ids;
        result = { id: first_id, viewer_id };
      },
    },
  );
  return result;
}

defineExpose({ get_viewer_id });
</script>

<template>
  <ViewerTreeLayout @show-menu="(args) => emit('show-menu', args)" />
  <ViewerContextMenu
    v-if="displayMenu"
    :id="menuStore.current_id"
    :x="menuStore.menuX"
    :y="menuStore.menuY"
    :container-width="containerWidth"
    :container-height="containerHeight"
  />
</template>
