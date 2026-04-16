<script setup>
const DEFAULT_SIZE = 22;
const DEFAULT_WIDTH = 3;

const {
  text = "Fetching data...",
  size = DEFAULT_SIZE,
  width = DEFAULT_WIDTH,
} = defineProps({
  text: {
    type: String,
  },
  size: {
    type: [Number, String],
  },
  width: {
    type: [Number, String],
  },
});
</script>

<template>
  <Transition name="slide-fade">
    <v-row align="center" justify="center" class="pa-0 ma-0 fill-height">
      <v-col cols="auto" class="pa-0 d-flex flex-column align-center">
        <v-progress-circular
          :size="size"
          :width="width"
          color="primary"
          indeterminate
          class="ma-2"
        />
        <p v-if="text" class="text-body-2 text-medium-emphasis">
          {{ text }}
        </p>
      </v-col>
    </v-row>
  </Transition>
</template>

<style scoped>
.fill-height {
  height: 100%;
  min-height: 100px;
}
</style>
