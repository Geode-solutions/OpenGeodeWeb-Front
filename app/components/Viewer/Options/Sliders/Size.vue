<script setup lang="ts">
import Slider from "./Slider.vue";

const size = defineModel<number>();
</script>

<template>
  <Slider v-model="size" :tooltip="'Size'" />
</template>
