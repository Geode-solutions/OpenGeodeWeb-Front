<script setup>
import AttributeRangeSelector from "./AttributeRangeSelector.vue";
import ColorMapPicker from "./ColorMapPicker.vue";

const emit = defineEmits(["reset"]);

const minimum = defineModel("minimum", { type: Number });
const maximum = defineModel("maximum", { type: Number });
const colorMap = defineModel("colorMap", { type: String });
</script>

<template>
  <div class="attribute-colorbar mt-3">
    <ColorMapPicker v-model:selected-preset-name="colorMap" :min="minimum" :max="maximum" />
    <AttributeRangeSelector
      v-model:minimum="minimum"
      v-model:maximum="maximum"
      class="mt-2"
      @reset="emit('reset')"
    />
  </div>
</template>

<style scoped>
.attribute-colorbar {
  width: 100%;
}
</style>
