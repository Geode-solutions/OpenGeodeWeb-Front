<script setup>
import BasicSlider from "@ogw_front/components/Basic/Slider";

const model = defineModel();
const { tooltip } = defineProps({
  tooltip: { type: String, required: true },
});
</script>

<template>
  <v-col cols="auto" justify="center">
    <v-icon size="30" icon="mdi-ruler" v-tooltip:left="tooltip" />
  </v-col>
  <v-col justify="center">
    <BasicSlider v-model="model" />
  </v-col>
</template>
