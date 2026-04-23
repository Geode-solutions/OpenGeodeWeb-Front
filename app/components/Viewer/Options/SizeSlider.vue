<script setup>
import BasicSlider from "@ogw_front/components/Basic/Slider";

const size = defineModel();

const { tooltip } = defineProps({
  tooltip: { type: String, required: true },
});
</script>

<template>
  <v-col cols="auto" justify="center">
    <v-icon size="30" icon="mdi-ruler" v-tooltip:left="'Width'" />
  </v-col>
  <v-col justify="center">
    <BasicSlider v-model="size" />
  </v-col>
</template>
