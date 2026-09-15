<script setup lang="ts">
import List from "@ogw_front/components/CameraManager/List.vue";
import Saver from "@ogw_front/components/CameraManager/Saver.vue";
import ToolPanel from "@ogw_front/components/ToolPanel.vue";

const DEFAULT_PANEL_WIDTH = 260;

interface Emits {
  close: [];
}

const emit = defineEmits<Emits>();

interface Props {
  showDialog: boolean;
  width?: number;
  escapeFunction?: () => void;
}

const {
  showDialog,
  width = DEFAULT_PANEL_WIDTH,
  escapeFunction = undefined,
} = defineProps<Props>();

function handleClose(): void {
  if (escapeFunction) {
    escapeFunction();
  } else {
    emit("close");
  }
}

const show = computed<boolean>({
  get: () => showDialog,
  set: (val) => {
    if (!val) {
      handleClose();
    }
  },
});
</script>

<template>
  <ToolPanel v-model="show" title="Camera Positions" :width="width" :escapeFunction="handleClose">
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
