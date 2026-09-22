<script setup lang="ts">
const DEFAULT_ICON_SIZE = 28;

interface Props {
  icon: string;
  tooltip: string;
  color?: string;
  size?: string | number;
  variant?: unknown;
  density?: unknown;
  tooltipLocation?: string;
  iconSize?: string | number;
}

const {
  icon,
  tooltip,
  color = undefined,
  size = undefined,
  variant = undefined,
  density = "comfortable",
  tooltipLocation = "left",
  iconSize = DEFAULT_ICON_SIZE,
} = defineProps<Props>();

interface Emits {
  click: [event: MouseEvent];
}

const emit = defineEmits<Emits>();
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
    <v-icon v-if="typeof icon === 'string' && icon.startsWith('mdi-')" :size="iconSize">{{
      icon
    }}</v-icon>
    <v-img
      v-else
      :src="icon"
      :height="iconSize"
      :width="iconSize"
      class="d-flex justify-center align-center"
    />
  </v-btn>
</template>
