<script setup lang="ts">
import { SLICE_AXES, type SliceAxis } from "@ogw_front/utils/clipping_planes";

interface Props {
  slice: { axis: SliceAxis; index: number };
  index: number;
  maxIndex: number;
}

const { slice, index, maxIndex } = defineProps<Props>();

interface Emits {
  remove: [];
}

const emit = defineEmits<Emits>();
</script>

<template>
  <v-card data-testid="sliceCard" variant="outlined" class="pa-2 mb-3 rounded-lg border-opacity-50">
    <v-row align="center" no-gutters class="mb-1">
      <v-col cols="auto">
        <v-chip size="x-small" variant="flat" color="primary" class="font-weight-bold">
          Slice #{{ index + 1 }}
        </v-chip>
      </v-col>
      <v-col class="px-2">
        <v-slider
          v-model="slice.index"
          data-testid="sliceIndexSlider"
          :min="0"
          :max="maxIndex"
          :step="1"
          color="primary"
          track-color="grey-lighten-2"
          density="compact"
          hide-details
        />
      </v-col>
      <v-col cols="auto">
        <v-btn
          data-testid="removeSliceButton"
          icon="mdi-trash-can-outline"
          size="x-small"
          variant="text"
          color="error"
          @click="emit('remove')"
        />
      </v-col>
    </v-row>

    <v-row align="center" justify="space-between" no-gutters>
      <v-col cols="auto">
        <v-btn-toggle
          v-model="slice.axis"
          data-testid="sliceAxisToggle"
          mandatory
          density="compact"
          color="primary"
          variant="outlined"
          divided
        >
          <v-btn
            v-for="axis in SLICE_AXES"
            :key="axis.value"
            :value="axis.value"
            size="small"
            class="text-caption"
          >
            {{ axis.title }}
          </v-btn>
        </v-btn-toggle>
      </v-col>
      <v-col cols="auto" class="text-caption text-primary font-weight-bold">
        {{ slice.index }} / {{ maxIndex }}
      </v-col>
    </v-row>
  </v-card>
</template>
