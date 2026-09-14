<script setup lang="ts">
import BasicSlider from "@ogw_front/components/Basic/Slider";

const model = defineModel<number>();

interface Props {
  tooltip: string;
}

const { tooltip } = defineProps<Props>();
</script>

<template>
  <v-row align="center" no-gutters class="px-2">
    <v-col cols="auto" class="mr-2">
      <v-icon size="18" icon="mdi-ruler" v-tooltip:left="tooltip" />
    </v-col>
    <v-col>
      <BasicSlider v-model="model" />
    </v-col>
  </v-row>
</template>
