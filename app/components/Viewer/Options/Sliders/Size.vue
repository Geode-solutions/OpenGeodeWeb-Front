<script setup>
import Slider from "./Slider";

const size = defineModel({ type: Number });
</script>

<template>
  <Slider v-model="size" :tooltip="'Size'" />
</template>
