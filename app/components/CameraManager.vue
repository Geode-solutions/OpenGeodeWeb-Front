<script setup>
import GlassCard from "@ogw_front/components/GlassCard";
import Saver from "@ogw_front/components/CameraManager/Saver";
import List from "@ogw_front/components/CameraManager/List";

const emit = defineEmits(["close"]);

defineProps({
  show_dialog: { type: Boolean, required: true },
  width: { type: Number, required: false, default: 450 },
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
    style="z-index: 2; top: 90px; right: 55px"
  >
    <v-card-text class="pa-0">
      <Saver />
      <v-divider></v-divider>
      <List />
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="pa-4">
      <v-spacer></v-spacer>
      <v-btn variant="text" color="grey-darken-1" @click="emit('close')">Close</v-btn>
    </v-card-actions>
  </GlassCard>
</template>
