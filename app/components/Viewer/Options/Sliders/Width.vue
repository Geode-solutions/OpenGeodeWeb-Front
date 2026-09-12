<script setup lang="ts">
import Slider from "./Slider.vue";

const width = defineModel({ type: Number });
</script>

<template>
  <Slider v-model="width" :tooltip="'Width'" />
</template>
