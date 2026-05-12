<script setup>
import Slider from "./Slider";
const width = defineModel();
</script>

<template>
  <Slider v-model="width" :tooltip="'Width'" />
</template>
