<script setup>
import Slider from "./Slider";
const size = defineModel();
</script>

<template>
  <Slider v-model="size" :tooltip="'Size'" />
</template>
