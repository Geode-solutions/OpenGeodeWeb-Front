<script setup>
  import ColorMapPicker from "./ColorMapPicker.vue"

  const props = defineProps({
    autoMin: { type: Number, default: 0 },
    autoMax: { type: Number, default: 1 },
  })

  const minimum = defineModel("minimum", { type: Number })
  const maximum = defineModel("maximum", { type: Number })
  const colorMap = defineModel("colorMap", {
    type: String,
    default: "Cool to Warm",
  })

  const minValue = computed({
    get: () => minimum.value ?? props.autoMin,
    set: (val) => {
      minimum.value = val
    },
  })

  const maxValue = computed({
    get: () => maximum.value ?? props.autoMax,
    set: (val) => {
      maximum.value = val
    },
  })

  onMounted(() => {
    if (minimum.value === undefined) minimum.value = props.autoMin
    if (maximum.value === undefined) maximum.value = props.autoMax
  })

  function reset() {
    minimum.value = props.autoMin
    maximum.value = props.autoMax
  }
</script>

<template>
  <div class="attribute-colorbar mt-3">
    <ColorMapPicker v-model="colorMap" :min="minValue" :max="maxValue" />

    <v-row dense align="center" class="mt-2">
      <v-col cols="5">
        <v-text-field
          v-model.number="minValue"
          label="Min"
          type="number"
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
          v-model.number="maxValue"
          label="Max"
          type="number"
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
