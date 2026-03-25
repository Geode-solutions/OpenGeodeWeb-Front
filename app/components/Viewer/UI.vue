<script setup>
import ViewerContextMenu from "@ogw_front/components/Viewer/ContextMenu";
import ViewerTreeObjectTree from "@ogw_front/components/Viewer/Tree/ObjectTree";

defineProps({
  id: { type: String, required: true },
  displayMenu: { type: Boolean, required: true },
  menuStore: { type: Object, required: true },
  containerWidth: { type: Number, required: true },
  containerHeight: { type: Number, required: true },
});

const emit = defineEmits(["show-menu"]);
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
