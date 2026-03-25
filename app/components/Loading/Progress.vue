<script setup>
const { progress } = defineProps({
  progress: {
    type: Number,
    required: true,
  },
});
</script>

<template>
  <v-progress-linear
    color="white"
    height="10"
    indeterminate
    rounded
    bg-color="white"
    bg-opacity="0.15"
    class="custom-progress-glow mt-8"
  />
</template>

<style scoped>
.custom-progress-glow :deep(.v-progress-linear__indeterminate) {
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
}
</style>
