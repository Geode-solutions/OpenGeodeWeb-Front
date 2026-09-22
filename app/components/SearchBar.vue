<script setup lang="ts">
interface Props {
  modelValue?: string;
  label?: string;
}

const { modelValue = "", label = "" } = defineProps<Props>();

interface Emits {
  "update:modelValue": [value: string];
}

const emit = defineEmits<Emits>();
</script>

<template>
  <v-text-field
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    prepend-inner-icon="mdi-magnify"
    :label="label"
    variant="outlined"
    density="compact"
    hide-details
    bg-color="transparent"
    color="white"
    base-color="white"
    v-bind="$attrs"
  >
    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}"></slot>
    </template>
  </v-text-field>
</template>
