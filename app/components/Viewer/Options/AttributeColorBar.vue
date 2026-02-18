<script setup>
  import ColorMapPicker from "./ColorMapPicker.vue"

  const emit = defineEmits(["reset"])

  const minimum = defineModel("minimum", { type: Number })
  const maximum = defineModel("maximum", { type: Number })
  const colorMap = defineModel("colorMap", { type: String })

  function reset() {
    emit("reset")
  }
</script>

<template>
  <div class="attribute-colorbar mt-3">
    <ColorMapPicker v-model="colorMap" :min="minimum" :max="maximum" />
    <v-row dense align="center" class="mt-2">
      <v-col cols="5">
        <v-text-field
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
          @click="reset"
          v-tooltip="'Reset range'"
        />
      </v-col>
      <v-col cols="5">
        <v-text-field
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
  </div>
</template>

<style scoped>
  .attribute-colorbar {
    width: 100%;
  }
</style>
