<script setup>
// oxlint-disable id-length
const colorPickerRef = useTemplateRef("colorPickerRef");
const model = defineModel();
const { pressed } = useMousePressed({ target: colorPickerRef });

const vuetifyColor = ref({
  r: model.value.red,
  g: model.value.green,
  b: model.value.blue,
  a: model.value.alpha,
});

watch(
  model,
  (newValue) => {
    vuetifyColor.value = {
      r: newValue.red,
      g: newValue.green,
      b: newValue.blue,
      a: newValue.alpha,
    };
  },
  { deep: true },
);

watch(pressed, (value) => {
  if (!value) {
    model.value = {
      red: vuetifyColor.value.r,
      green: vuetifyColor.value.g,
      blue: vuetifyColor.value.b,
      alpha: vuetifyColor.value.a,
    };
  }
});
</script>

<template>
  <v-color-picker
    ref="colorPickerRef"
    v-model="vuetifyColor"
    flat
    canvas-height="100"
    hide-inputs
    width="100%"
    mode="rgba"
  />
</template>
