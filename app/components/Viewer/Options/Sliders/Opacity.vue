<script setup lang="ts">
const opacity = defineModel<number>();
</script>

<template>
  <v-row align="center" no-gutters class="px-2">
    <v-col cols="auto" class="mr-2">
      <v-icon size="18" icon="mdi-circle-opacity" v-tooltip:left="'Opacity'" />
    </v-col>
    <v-col>
      <v-slider
        data-testid="opacitySlider"
        v-model="opacity"
        hide-details
        min="0"
        max="1"
        step="0.05"
        density="compact"
      />
    </v-col>
  </v-row>
</template>
