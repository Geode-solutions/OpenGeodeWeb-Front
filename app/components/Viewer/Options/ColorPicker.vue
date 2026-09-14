<script setup lang="ts">
// oxlint-disable id-length
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";

interface Props {
  disabledAlpha?: boolean;
}

const { disabledAlpha = false } = defineProps<Props>();

// The useMousePressed composable only needs the underlying DOM element (it unwraps a component ref's $el at runtime); typing this as the actual Vuetify component instance produces a union too complex for TS to represent.
const colorPickerRef = useTemplateRef<HTMLElement>("colorPickerRef");
const model = defineModel<RGBAColor>();
const { pressed } = useMousePressed({ target: colorPickerRef });

// The model is always bound by every current caller (ColoringTypeSelector, AttributeSelector); defineModel can't express that as a required prop without breaking its optional v-model contract, so this reads it as defined here.
const initialColor = model.value as RGBAColor;
const vuetifyColor = ref({
  r: initialColor.red,
  g: initialColor.green,
  b: initialColor.blue,
  a: initialColor.alpha,
});

watch(
  model,
  (newValue) => {
    if (!newValue) {
      return;
    }
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
