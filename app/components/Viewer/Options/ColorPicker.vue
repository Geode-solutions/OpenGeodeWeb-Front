<script setup>
// oxlint-disable id-length
import { formatColorString, parseColorString } from "@ogw_front/utils/color_picker";
import { useClipboard } from "@vueuse/core";

const COPIED_TIMEOUT = 1500;

const { disabledAlpha } = defineProps({
  disabledAlpha: {
    type: Boolean,
    default: false,
  },
});

const colorPickerRef = useTemplateRef("colorPickerRef");
const model = defineModel({ type: Object });
const { pressed } = useMousePressed({ target: colorPickerRef });
const { copy, copied } = useClipboard({ copiedDuring: COPIED_TIMEOUT });

const vuetifyColor = ref({
  r: model.value.red,
  g: model.value.green,
  b: model.value.blue,
  a: model.value.alpha,
});

const currentMode = ref(disabledAlpha ? "rgb" : "rgba");

function updateModel() {
  const { r: red, g: green, b: blue, a: alpha } = vuetifyColor.value;

  if (
    model.value.red !== red ||
    model.value.green !== green ||
    model.value.blue !== blue ||
    model.value.alpha !== alpha
  ) {
    model.value = { red, green, blue, alpha };
  }
}

function copyToClipboard() {
  copy(formatColorString(model.value, currentMode.value));
}

function handlePaste(event) {
  const parsedColor = parseColorString(event.clipboardData.getData("text"));
  if (parsedColor) {
    event.preventDefault();
    const { red, green, blue, alpha } = parsedColor;
    vuetifyColor.value = {
      r: red,
      g: green,
      b: blue,
      a: disabledAlpha ? 1 : alpha,
    };
    updateModel();
  }
}

watch(
  model,
  (newValue) => {
    if (!newValue) {
      return;
    }
    const { red, green, blue, alpha } = newValue;
    const hasChanged =
      red !== vuetifyColor.value.r ||
      green !== vuetifyColor.value.g ||
      blue !== vuetifyColor.value.b ||
      alpha !== vuetifyColor.value.a;
    if (hasChanged) {
      vuetifyColor.value = { r: red, g: green, b: blue, a: alpha };
    }
  },
  { deep: true },
);

watch(
  [vuetifyColor, pressed],
  ([, isPressed]) => {
    if (!isPressed) {
      updateModel();
    }
  },
  { deep: true },
);
</script>

<template>
  <div @paste="handlePaste" class="color-picker-container position-relative mx-auto">
    <v-color-picker
      ref="colorPickerRef"
      data-testid="colorPicker"
      v-model="vuetifyColor"
      v-model:mode="currentMode"
      flat
      canvas-height="75"
      hide-eye-dropper
      :disabled-alpha="disabledAlpha"
      width="220"
      :modes="disabledAlpha ? ['rgb'] : ['rgba', 'rgb']"
      class="mx-auto"
    />
    <v-btn
      icon
      density="compact"
      variant="text"
      size="small"
      class="copy-color-btn"
      @click="copyToClipboard"
      v-tooltip="'Copy to clipboard'"
    >
      <v-icon
        :icon="copied ? 'mdi-check' : 'mdi-content-copy'"
        size="16"
        :color="copied ? 'success' : undefined"
      />
    </v-btn>
  </div>
</template>

<style scoped>
.color-picker-container {
  width: 220px;
}

:deep(.v-color-picker__controls) {
  padding: 0 8px 4px !important;
}

:deep(.v-color-picker__dot) {
  width: 18px !important;
  height: 18px !important;
}

:deep(.v-color-picker__preview) {
  margin-bottom: 0 !important;
}

:deep(.v-color-picker-edit),
:deep(.v-color-picker__edit) {
  margin-top: 0 !important;
  padding: 1 24px 0 !important;
  padding-top: 8px;
}

.copy-color-btn {
  position: absolute;
  right: 14px;
  bottom: 7px;
  z-index: 2;
}
</style>
