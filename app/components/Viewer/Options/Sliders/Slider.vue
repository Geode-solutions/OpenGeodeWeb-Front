<script setup lang="ts">
import BasicSlider from "@ogw_front/components/Basic/Slider.vue";
import type { Tooltip } from "@ogw_front/types/ui";

interface Props {
  tooltip: Tooltip;
}

const model = defineModel<number>();

const { tooltip } = defineProps<Props>();
</script>

<template>
  <v-row align="center" no-gutters class="px-2">
    <v-col cols="auto" class="mr-2">
      <v-icon size="18" icon="ph-ruler" v-tooltip:left="tooltip" />
    </v-col>
    <v-col>
      <BasicSlider v-model="model" />
    </v-col>
  </v-row>
</template>
