<script setup>
const model = defineModel();
</script>

<template>
  <v-switch v-model="model" inset hide-details density="compact" class="compact-switch" />
</template>

<style scoped>
.compact-switch {
  transform: scale(0.75);
  transform-origin: left center;
  width: 40px;
}
</style>
