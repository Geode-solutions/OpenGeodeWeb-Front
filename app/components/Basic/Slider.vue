<script setup>
const model = defineModel({ type: Number });
</script>

<template>
  <v-slider v-model="model" hide-details min="0" max="20" step="2" density="compact" />
</template>
