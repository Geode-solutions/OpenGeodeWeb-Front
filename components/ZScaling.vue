<template>
  <v-sheet
    :width="width + 'px'"
    class="z-scaling-menu"
    elevation="10"
    rounded="lg"
  >
    <v-card class="bg-primary pa-4" elevation="0">
      <v-card-title class="d-flex justify-space-between align-center">
        <h3 class="text-h5 font-weight-bold">Z Scaling Control</h3>
      </v-card-title>
      <v-card-text class="pt-4">
        <v-container>
          <v-row>
            <v-col cols="12" class="py-2">
              <v-slider
                v-model="localZScale"
                :min="1"
                :max="10"
                :step="0.2"
                label="Z Scale"
                thumb-label
                color="white"
                track-color="white"
              ></v-slider>
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="12" class="py-2">
              <v-text-field
                v-model.number="localZScale"
                type="number"
                label="Z Scale Value"
                outlined
                dense
                hide-details
                step="0.1"
                class="custom-number-input"
                :min="1"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions class="justify-center pb-4">
        <v-btn
          variant="text"
          color="white"
          @click="$emit('close')"
          class="px-4"
        >
          Close
        </v-btn>
        <v-btn
          variant="outlined"
          color="white"
          @click="updateZScaling"
          class="px-4"
        >
          Apply
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-sheet>
</template>

<script setup>
  const props = defineProps({
    modelValue: Number,
    width: { type: Number, required: false, default: 400 },
  })

  const emit = defineEmits(["update:modelValue", "close"])

  const localZScale = ref(Math.max(props.modelValue, 1))

  watch(
    () => props.modelValue,
    (newVal) => {
      localZScale.value = Math.max(newVal, 1)
    },
  )

  function updateZScaling() {
    emit("update:modelValue", localZScale.value)
    emit("close")
  }
</script>

<style scoped>
  .z-scaling-menu {
    position: absolute;
    z-index: 2;
    top: 90px;
    right: 55px;
    border-radius: 12px !important;
  }

  .custom-number-input :deep(.v-input__control) {
    min-height: 48px;
  }

  .v-btn {
    border-radius: 8px;
    text-transform: none;
    font-weight: 500;
    letter-spacing: normal;
  }
</style>
