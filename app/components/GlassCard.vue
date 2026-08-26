<script setup>
import { computed, useAttrs } from "vue";
import { onKeyStroke } from "@vueuse/core";

const { variant, rounded, padding, theme, escapeFunction } = defineProps({
  variant: {
    type: String,
    default: "panel",
    validator: (valid) => ["panel", "ui"].includes(valid),
  },
  rounded: { type: String, default: "xl" },
  padding: { type: String, default: "pa-6" },
  theme: { type: String, default: undefined },
  escapeFunction: { type: Function, default: undefined },
});

const attrs = useAttrs();
const isInteractive = computed(() => Boolean(attrs.onClick));

onKeyStroke("Escape", () => {
  if (escapeFunction) {
    escapeFunction();
  }
});
</script>

<template>
  <v-card
    @mousedown.stop
    @click.stop
    @dblclick.stop
    @contextmenu.stop
    flat
    :ripple="isInteractive"
    :theme="theme || (variant === 'panel' ? 'dark' : undefined)"
    :class="[
      variant === 'panel' ? 'glass-panel' : 'glass-ui',
      'border-thin',
      `rounded-${rounded}`,
      padding,
      { 'cursor-default': !isInteractive },
    ]"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps || {}" />
    </template>
  </v-card>
</template>

<style scoped>
.border-thin {
  border-style: solid !important;
}

.cursor-default {
  cursor: default !important;
}
</style>
