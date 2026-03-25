<script setup>
const DEFAULT_ICON_SIZE = 28;
const { icon, tooltip, color, size, variant, density, tooltipLocation, iconSize } = defineProps({
  icon: { type: String, required: true },
  tooltip: { type: String, required: true },
  color: { type: String, default: undefined },
  size: { type: [String, Number], default: undefined },
  variant: { type: String },
  density: { type: String, default: "comfortable" },
  tooltipLocation: { type: String, default: "left" },
  iconSize: { type: [String, Number], default: DEFAULT_ICON_SIZE },
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
