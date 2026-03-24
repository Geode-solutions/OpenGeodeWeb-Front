<script setup>
const DEFAULT_ICON_SIZE = 28;
const {
  icon,
  tooltip,
  color = undefined,
  size = undefined,
  variant = undefined,
  density = "comfortable",
  tooltipLocation = "left",
  iconSize = DEFAULT_ICON_SIZE,
} = defineProps({
  icon: { type: String, required: true },
  tooltip: { type: String, required: true },
  color: { type: String },
  size: { type: [String, Number] },
  variant: { type: String },
  density: { type: String },
  tooltipLocation: { type: String },
  iconSize: { type: [String, Number] },
});

const emit = defineEmits(["click"]);
</script>

<template>
  <v-btn
    :color="color"
    :size="size"
    :variant="variant"
    :density="density"
    v-tooltip:[tooltipLocation]="tooltip"
    v-bind="$attrs"
    icon
    @click="emit('click', $event)"
  >
    <v-icon :size="iconSize">{{ icon }}</v-icon>
  </v-btn>
</template>
