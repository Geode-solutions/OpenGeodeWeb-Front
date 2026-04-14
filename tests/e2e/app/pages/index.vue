<script setup>
import { Status } from "@ogw_front/utils/status";
import { useDataStore } from "@ogw_front/stores/data";
import { useInfraStore } from "@ogw_front/stores/infra";
import { useMenuStore } from "@ogw_front/stores/menu";

import HybridRenderingView from "@ogw_front/components/HybridRenderingView";
import ViewerUI from "@ogw_front/components/Viewer/Ui";

const menuStore = useMenuStore();
const infraStore = useInfraStore();
const dataStore = useDataStore();

const containerWidth = ref(0);
const containerHeight = ref(0);
const cardContainer = useTemplateRef("cardContainer");
const viewerUI = useTemplateRef("viewerUI");

const { display_menu } = storeToRefs(menuStore);

async function handleTreeMenu({ event, itemId, context_type, modelId }) {
  const rect = cardContainer.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const yUI = event.clientY - rect.top;

  const meta_data =
    context_type === "model_component"
      ? {
          viewer_type: "model_component",
          geode_object_type: "component",
          modelId,
          pickedComponentId: itemId,
        }
      : await dataStore.item(itemId);

  menuStore.openMenu(
    itemId,
    x,
    yUI,
    containerWidth.value,
    containerHeight.value,
    rect.top,
    rect.left,
    meta_data,
  );
}

async function openMenu(event) {
  const rect = cardContainer.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const yPicking = containerHeight.value - (event.clientY - rect.top);
  const yUI = event.clientY - rect.top;

  const { id: pickedId, viewer_id } = await viewerUI.value.get_viewer_id(x, yPicking);
  if (!pickedId) {
    return;
  }
  const item = await dataStore.item(pickedId);

  if (item.viewer_type === "model" && viewer_id !== undefined) {
    const component = await dataStore.getComponentByViewerId(pickedId, viewer_id);
    if (component) {
      item.pickedComponentId = component.geode_id;
    }
  }

  menuStore.openMenu(
    pickedId,
    x,
    yUI,
    containerWidth.value,
    containerHeight.value,
    rect.top,
    rect.left,
    item,
  );
}

const { width: elWidth, height: elHeight } = useElementSize(cardContainer);

watch([elWidth, elHeight], ([width, height]) => {
  containerWidth.value = width;
  containerHeight.value = height;
});

onMounted(() => {
  infraStore.create_backend();
});
</script>

<template>
  <div
    v-if="infraStore.status === Status.CREATED"
    ref="cardContainer"
    style="width: 100%; height: 100vh"
    @contextmenu.prevent="openMenu"
  >
    <HybridRenderingView />
  </div>
</template>
