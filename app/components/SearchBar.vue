<template>
  <v-text-field
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
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

<script setup>
  defineProps({
    modelValue: {
      type: String,
      default: "",
    },
    label: {
      type: String,
      default: "Search...",
    },
  })

  defineEmits(["update:modelValue"])
</script>
