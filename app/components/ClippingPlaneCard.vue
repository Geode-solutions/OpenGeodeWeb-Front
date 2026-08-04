<script setup>
import { getPlaneCssColor } from "@ogw_front/utils/clipping_planes";

const { plane, index } = defineProps({
  plane: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["remove", "flipNormal"]);
</script>

<template>
  <v-card
    data-testid="planeCard"
    variant="outlined"
    class="pa-2 mb-3 rounded-lg border-opacity-50"
    :style="{ borderColor: getPlaneCssColor(index) }"
  >
    <v-row align="center" justify="space-between" no-gutters class="mb-1">
      <v-col cols="auto" class="d-flex align-center">
        <v-chip
          size="x-small"
          variant="flat"
          :style="{
            backgroundColor: getPlaneCssColor(index),
            color: 'white',
          }"
          class="font-weight-bold"
        >
          Plane #{{ index + 1 }}
        </v-chip>
      </v-col>
      <v-col cols="auto">
        <v-btn
          data-testid="removePlaneButton"
          icon="mdi-trash-can-outline"
          size="x-small"
          variant="text"
          color="error"
          @click="emit('remove')"
        />
      </v-col>
    </v-row>

    <v-row no-gutters class="mb-1">
      <v-col class="text-caption text-medium-emphasis">Origin [X, Y, Z]</v-col>
    </v-row>
    <v-row v-if="plane.origin" dense class="mb-2">
      <v-col v-for="axis in 3" :key="'orig-' + axis" cols="4">
        <v-text-field
          v-model.number="plane.origin[axis - 1]"
          data-testid="planeOriginInput"
          type="number"
          variant="outlined"
          density="compact"
          hide-details
          step="any"
          class="text-caption"
        />
      </v-col>
    </v-row>
    <v-row v-else dense class="mb-2">
      <v-col v-for="axis in 3" :key="'orig-placeholder-' + axis" cols="4">
        <v-text-field
          placeholder="—"
          variant="outlined"
          density="compact"
          hide-details
          disabled
          class="text-caption"
        />
      </v-col>
    </v-row>

    <v-row align="center" justify="space-between" no-gutters class="mb-1">
      <v-col class="text-caption text-medium-emphasis">Normal [X, Y, Z]</v-col>
      <v-col cols="auto">
        <v-btn
          data-testid="invertNormalButton"
          size="x-small"
          variant="text"
          color="primary"
          prepend-icon="mdi-swap-horizontal"
          class="text-none text-caption px-1"
          @click="emit('flipNormal')"
        >
          Invert Normal
        </v-btn>
      </v-col>
    </v-row>
    <v-row dense>
      <v-col v-for="axis in 3" :key="'norm-' + axis" cols="4">
        <v-text-field
          v-model.number="plane.normal[axis - 1]"
          data-testid="planeNormalInput"
          type="number"
          variant="outlined"
          density="compact"
          hide-details
          step="any"
          class="text-caption"
        />
      </v-col>
    </v-row>
  </v-card>
</template>
