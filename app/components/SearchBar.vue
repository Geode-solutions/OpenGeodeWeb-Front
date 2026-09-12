<script setup lang="ts">
// oxlint-disable-next-line vue/define-props-declaration
const { modelValue, label } = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "" },
});

// oxlint-disable-next-line vue/define-emits-declaration
const emit = defineEmits(["update:modelValue"]);
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
