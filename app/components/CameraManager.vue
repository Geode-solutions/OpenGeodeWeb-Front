<script setup>
import List from "@ogw_front/components/CameraManager/List";
import Saver from "@ogw_front/components/CameraManager/Saver";
import ToolPanel from "@ogw_front/components/ToolPanel";

const emit = defineEmits(["close"]);

const { showDialog, width, escapeFunction } = defineProps({
  showDialog: { type: Boolean, required: true },
  width: { type: Number, required: false, default: 260 },
  escapeFunction: { type: Function, default: undefined },
});

const show = computed({
  get: () => showDialog,
  set: (val) => {
    if (!val) {
      handleClose();
    }
  },
});

function handleClose() {
  if (escapeFunction) {
    escapeFunction();
  } else {
    emit("close");
  }
}
</script>

<template>
  <ToolPanel
    v-model="show"
    title="Camera Positions"
    :width="width"
    :escapeFunction="handleClose"
    style="top: 90px; right: 55px"
    z-index="1"
  >
    <v-card-text class="pa-0">
      <Saver />
      <v-divider />
      <List />
    </v-card-text>

    <template #actions>
      <v-card-actions class="justify-center pb-3 pt-0" style="gap: 8px">
        <v-btn
          variant="text"
          size="small"
          color="white"
          class="text-caption text-none"
          data-testid="closeCameraManagerButton"
          @click="handleClose"
        >
          Close
        </v-btn>
      </v-card-actions>
    </template>
  </ToolPanel>
</template>

<style scoped>
:deep(.v-card-title) {
  font-size: 0.95rem !important;
  font-weight: bold !important;
  padding: 10px 14px 6px 14px !important;
}
</style>
