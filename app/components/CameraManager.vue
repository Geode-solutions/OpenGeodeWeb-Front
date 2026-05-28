<script setup>
import GlassCard from "@ogw_front/components/GlassCard";
import List from "@ogw_front/components/CameraManager/List";
import Saver from "@ogw_front/components/CameraManager/Saver";

const emit = defineEmits(["close"]);

const { show_dialog, width } = defineProps({
  show_dialog: { type: Boolean, required: true },
  width: { type: Number, required: false, default: 260 },
});
</script>

<template>
  <GlassCard
    v-if="show_dialog"
    @click.stop
    title="Camera Positions"
    :width="width"
    :ripple="false"
    variant="panel"
    padding="pa-0"
    class="position-absolute elevation-24"
    style="top: 90px; right: 55px" z-index="1"
  >
    <v-card-text class="pa-0">
      <Saver />
      <v-divider></v-divider>
      <List />
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="pa-2">
      <v-spacer></v-spacer>
      <v-btn
        variant="text"
        size="small"
        color="white"
        class="text-caption text-none"
        @click="emit('close')"
        >Close</v-btn
      >
    </v-card-actions>
  </GlassCard>
</template>

<style scoped>
:deep(.v-card-title) {
  font-size: 0.95rem !important;
  font-weight: bold !important;
  padding: 10px 14px 6px 14px !important;
}
</style>
