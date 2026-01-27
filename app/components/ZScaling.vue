<template>
  <OptionCard title="Z Scaling Control" :width="width" class="z-scaling-menu">
    <v-container>
      <v-row>
        <v-col cols="12" class="py-2">
          <v-slider v-model="zScale" :min="1" :max="10" :step="0.2" label="Z Scale" thumb-label color="white"
            track-color="white" />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" class="py-2">
          <v-text-field v-model.number="zScale" type="number" label="Z Scale Value" outlined dense hide-details
            step="0.1" class="custom-number-input" :min="1" />
        </v-col>
      </v-row>
    </v-container>

    <template #actions>
      <v-btn variant="text" color="white" @click="$emit('close')">Close</v-btn>
      <v-btn variant="outlined" color="white" @click="$emit('close')">Apply</v-btn>
    </template>
  </OptionCard>
</template>

<script setup>
const zScale = defineModel({ type: Number, default: 1 })
const props = defineProps({
  width: { type: Number, default: 400 },
})
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
</style>
