<script setup lang="ts">
import type { Label, SearchQuery } from "@ogw_front/types/ui";

interface Props {
  modelValue?: SearchQuery;
  label?: Label;
}

interface Emits {
  "update:modelValue": [value: SearchQuery];
}

const { modelValue = "", label = "" } = defineProps<Props>();

const emit = defineEmits<Emits>();
</script>

<template>
  <v-text-field
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    prepend-inner-icon="ph-magnifying-glass"
    :label="label"
    variant="outlined"
    density="compact"
    hide-details
    bg-color="transparent"
    v-bind="$attrs"
  >
    <template v-for="(_, slot) in $slots" v-slot:[slot]="scope">
      <slot :name="slot" v-bind="scope || {}"></slot>
    </template>
  </v-text-field>
</template>
