<script setup>
const emit = defineEmits(["reset"]);

const minimum = defineModel("minimum", { type: Number });
const maximum = defineModel("maximum", { type: Number });
</script>

<template>
  <v-row dense align="center" no-gutters>
    <v-col cols="5" class="pe-1">
      <v-text-field
        data-testid="attributeMinInput"
        :model-value="minimum"
        @update:model-value="(value) => (minimum = Number(value))"
        label="Min"
        type="number"
        :max="maximum"
        density="compact"
        hide-details
        variant="outlined"
      />
    </v-col>
    <v-col cols="2" class="d-flex justify-center">
      <v-btn
        icon="mdi-arrow-left-right"
        size="x-small"
        variant="text"
        @click="emit('reset')"
        v-tooltip="'Reset range'"
      />
    </v-col>
    <v-col cols="5" class="ps-1">
      <v-text-field
        data-testid="attributeMaxInput"
        :model-value="maximum"
        @update:model-value="(value) => (maximum = Number(value))"
        label="Max"
        type="number"
        :min="minimum"
        density="compact"
        hide-details
        variant="outlined"
      />
    </v-col>
  </v-row>
</template>
