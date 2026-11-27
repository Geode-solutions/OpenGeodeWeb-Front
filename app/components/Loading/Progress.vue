<script setup lang="ts">
interface LoadingProgressProps {
  progress: number;
}

const { progress } = defineProps<LoadingProgressProps>();
</script>

<template>
  <v-progress-linear
    color="on-background"
    height="10"
    indeterminate
    rounded
    bg-color="on-background"
    bg-opacity="0.15"
    class="custom-progress-glow mt-4 mt-sm-8"
  />
</template>

<style scoped>
.custom-progress-glow :deep(.v-progress-linear__indeterminate .v-progress-linear__indeterminate) {
  background: var(--ogw-loading-progress, rgb(var(--v-theme-on-background))) !important;
}

.custom-progress-glow :deep(.v-progress-linear__indeterminate) {
  box-shadow: var(--ogw-loading-progress-glow, 0 0 15px rgba(255, 255, 255, 0.4));
}
</style>
