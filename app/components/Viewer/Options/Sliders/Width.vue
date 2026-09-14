<script setup lang="ts">
import Slider from "./Slider";

const width = defineModel<number>();
</script>

<template>
  <Slider v-model="width" :tooltip="'Width'" />
</template>
