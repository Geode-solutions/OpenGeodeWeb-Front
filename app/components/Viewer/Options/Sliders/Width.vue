<script setup>
import Slider from "./Slider";

const width = defineModel({ type: Number });
</script>

<template>
  <Slider v-model="width" :tooltip="'Width'" />
</template>
