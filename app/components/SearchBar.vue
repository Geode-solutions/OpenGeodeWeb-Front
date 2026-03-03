<script setup>
const { modelValue, label } = defineProps({
  modelValue: { type: String, default: "" },
  label: { type: String, default: "Search..." },
})

const emit = defineEmits(["update:modelValue"])

function onUpdateModelValue(value) {
  emit("update:modelValue", value)
}
</script>

<template>
  <v-text-field
    :model-value="modelValue"
    @update:model-value="onUpdateModelValue"
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
