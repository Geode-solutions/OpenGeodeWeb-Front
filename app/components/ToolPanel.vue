<script setup lang="ts">
import GlassCard from "@ogw_front/components/GlassCard";

const DEFAULT_PANEL_WIDTH = 260;

interface Props {
  title?: string;
  width?: number;
  closeLabel?: string;
  actionLabel?: string;
  clickOutside?: boolean;
  escapeFunction?: () => void;
}

const {
  title = "",
  width = DEFAULT_PANEL_WIDTH,
  closeLabel = "Close",
  actionLabel = undefined,
  clickOutside = true,
  escapeFunction = undefined,
} = defineProps<Props>();

const model = defineModel<boolean>({ default: false });
const emit = defineEmits<{
  action: [];
}>();

function close() {
  if (escapeFunction) {
    escapeFunction();
  }
  model.value = false;
}
</script>

<template>
  <GlassCard
    v-if="model"
    v-click-outside="{ handler: close, closeConditional: () => clickOutside }"
    :title="title"
    :width="width"
    :ripple="false"
    variant="panel"
    padding="pa-0"
    class="position-absolute rounded-xl elevation-24 tool-panel"
    :escapeFunction="close"
    v-bind="$attrs"
  >
    <v-card-text class="pa-0 overflow-hidden position-relative">
      <slot />
    </v-card-text>

    <template #actions>
      <slot name="actions">
        <v-card-actions class="justify-center pb-3 pt-0" style="gap: 8px">
          <v-btn
            variant="text"
            size="small"
            color="white"
            class="text-caption text-none"
            @click="close"
          >
            {{ closeLabel }}
          </v-btn>
          <v-btn
            v-if="actionLabel"
            data-testid="toolPanelActionButton"
            variant="outlined"
            size="small"
            color="white"
            class="text-caption text-none"
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
  z-index: 1;
  top: 90px;
  right: 70px;
}
:deep(.v-card-title) {
  font-size: 0.9rem !important;
  font-weight: bold !important;
  padding: 8px 12px 4px 12px !important;
}
</style>
