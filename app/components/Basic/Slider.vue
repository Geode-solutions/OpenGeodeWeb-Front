<script setup>
const model = defineModel();
</script>

<template>
  <v-slider v-model="model" hide-details min="0" max="20" step="2" />
</template>
