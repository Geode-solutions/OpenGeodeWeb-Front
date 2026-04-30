<script setup>
import GlassCard from "@ogw_front/components/GlassCard";

const { title, width, closeLabel, actionLabel } = defineProps({
  title: { type: String, default: "" },
  width: { type: Number, default: 400 },
  closeLabel: { type: String, default: "Close" },
  actionLabel: { type: String, default: undefined },
});

const model = defineModel({ type: Boolean, default: false });
const emit = defineEmits(["action"]);

function close() {
  model.value = false;
}
</script>

<template>
  <GlassCard
    v-if="model"
    v-click-outside="close"
    :title="title"
    :width="width"
    :ripple="false"
    variant="panel"
    padding="pa-0"
    class="position-absolute rounded-xl elevation-24 tool-panel"
    v-bind="$attrs"
  >
    <v-card-text class="pa-0 overflow-hidden position-relative">
      <slot />
    </v-card-text>

    <template #actions>
      <slot name="actions">
        <v-card-actions class="justify-center pb-6" style="gap: 12px">
          <v-btn variant="text" size="small" color="white" @click="close">
            {{ closeLabel }}
          </v-btn>
          <v-btn
            v-if="actionLabel"
            variant="outlined"
            size="small"
            color="white"
            @click="emit('action')"
          >
            {{ actionLabel }}
          </v-btn>
        </v-card-actions>
      </slot>
    </template>
  </GlassCard>
</template>

<style scoped>
.tool-panel {
  z-index: 2;
  top: 90px;
  right: 55px;
}
</style>
