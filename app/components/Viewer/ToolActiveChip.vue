<script setup lang="ts">
interface Props {
  label: string;
  color: string;
  icon: string;
}

const { label, color, icon } = defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();

defineOptions({ inheritAttrs: false });
</script>

<template>
  <div
    class="tool-active-container d-flex justify-center w-100 pa-4"
    :style="{ '--tool-active-color': `var(--v-theme-${color})` }"
  >
    <v-chip
      v-bind="$attrs"
      :color="color"
      :prepend-icon="icon"
      elevation="8"
      size="large"
      variant="flat"
      class="tool-active-pulse"
      style="pointer-events: auto"
      @click="emit('close')"
    >
      {{ label }} &middot; Esc to stop
      <v-divider vertical class="mx-2 my-1" opacity="0.3" />
      <v-icon icon="mdi-close" size="small" />
    </v-chip>
  </div>
</template>

<style scoped>
.tool-active-container {
  position: absolute;
  top: 20px;
  left: 0;
  pointer-events: none;
  z-index: 3;
}

@keyframes pulse-ring {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--tool-active-color), 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(var(--tool-active-color), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--tool-active-color), 0);
  }
}

.tool-active-pulse {
  animation: pulse-ring 1.5s ease-out infinite;
}
</style>
