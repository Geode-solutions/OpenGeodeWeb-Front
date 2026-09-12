<script setup lang="ts">
// oxlint-disable id-length
defineProps({
  disabledAlpha: {
    type: Boolean,
    default: false,
  },
});

// The useMousePressed composable only needs the underlying DOM element (it unwraps a component ref's $el at runtime); typing this as the actual Vuetify component instance produces a union too complex for TS to represent.
const colorPickerRef = useTemplateRef<HTMLElement>("colorPickerRef");
const model = defineModel({ type: Object });
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
    const hasChanged =
      newValue.red !== vuetifyColor.value.r ||
      newValue.green !== vuetifyColor.value.g ||
      newValue.blue !== vuetifyColor.value.b ||
      newValue.alpha !== vuetifyColor.value.a;
    if (!hasChanged) {
      return;
    }
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
    data-testid="colorPicker"
    v-model="vuetifyColor"
    flat
    canvas-height="75"
    hide-inputs
    hide-eye-dropper
    :disabled-alpha="disabledAlpha"
    width="220"
    :mode="disabledAlpha ? 'rgb' : 'rgba'"
    class="mx-auto"
  />
</template>

<style scoped>
:deep(.v-color-picker__controls) {
  padding: 8px !important;
}

:deep(.v-color-picker__dot) {
  width: 18px !important;
  height: 18px !important;
}

:deep(.v-color-picker__preview) {
  margin-bottom: 0 !important;
}
</style>
