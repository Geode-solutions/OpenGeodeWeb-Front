<script setup>
// oxlint-disable id-length since vuetify require { r,g,b} format to work
import { formatColorString, parseColorString } from "@ogw_front/utils/color_picker";
import { useClipboard } from "@vueuse/core";

const COPIED_TIMEOUT = 1500;

const { disabledAlpha = false } = defineProps({
  disabledAlpha: {
    type: Boolean,
    default: false,
  },
});

const model = defineModel({ type: Object, required: true });
const { copy, copied } = useClipboard({ copiedDuring: COPIED_TIMEOUT });

const currentMode = ref(disabledAlpha ? "rgb" : "rgba");
const colorInputText = ref("");

const vuetifyColor = ref({
  r: model.value?.red ?? 0,
  g: model.value?.green ?? 0,
  b: model.value?.blue ?? 0,
  a: model.value?.alpha ?? 1,
});

function updateInputTextFromColor(red, green, blue, alpha) {
  colorInputText.value =
    disabledAlpha || currentMode.value === "rgb"
      ? `${red}, ${green}, ${blue}`
      : `${red}, ${green}, ${blue}, ${alpha}`;
}

function onPickerUpdate(val) {
  if (!val) {
    return;
  }

  const red = Math.round(val.r ?? 0);
  const green = Math.round(val.g ?? 0);
  const blue = Math.round(val.b ?? 0);
  const alpha = disabledAlpha ? 1 : Number((val.a ?? 1).toFixed(2));

  vuetifyColor.value = { r: red, g: green, b: blue, a: alpha };
  model.value = { red, green, blue, alpha };
  updateInputTextFromColor(red, green, blue, alpha);
}

function toggleMode() {
  if (disabledAlpha) {
    return;
  }
  currentMode.value = currentMode.value === "rgba" ? "rgb" : "rgba";
  const { red = 0, green = 0, blue = 0, alpha = 1 } = model.value ?? {};
  updateInputTextFromColor(red, green, blue, alpha);
}

async function copyToClipboard() {
  const { r: red, g: green, b: blue, a: alpha } = vuetifyColor.value;
  await copy(formatColorString({ red, green, blue, alpha }, currentMode.value));
}

function parseAndApplyText(text) {
  const parsed = parseColorString(text);
  if (!parsed) {
    return false;
  }

  const { red, green, blue, alpha: rawAlpha } = parsed;
  const alpha = disabledAlpha ? 1 : rawAlpha;

  if (!disabledAlpha && alpha < 1) {
    currentMode.value = "rgba";
  }

  vuetifyColor.value = { r: red, g: green, b: blue, a: alpha };
  model.value = { red, green, blue, alpha };
  updateInputTextFromColor(red, green, blue, alpha);
  return true;
}

function onInputPaste(event) {
  event.preventDefault();
  const text = event.clipboardData?.getData("text/plain") || "";
  parseAndApplyText(text);
}

function onInputCommit() {
  if (!parseAndApplyText(colorInputText.value)) {
    const { red = 0, green = 0, blue = 0, alpha = 1 } = model.value ?? {};
    updateInputTextFromColor(red, green, blue, alpha);
  }
}

watch(
  () => model.value,
  (newVal) => {
    if (!newVal) {
      return;
    }
    const { red = 0, green = 0, blue = 0, alpha = 1 } = newVal;
    if (
      vuetifyColor.value.r !== red ||
      vuetifyColor.value.g !== green ||
      vuetifyColor.value.b !== blue ||
      vuetifyColor.value.a !== alpha
    ) {
      vuetifyColor.value = { r: red, g: green, b: blue, a: alpha };
    }
    updateInputTextFromColor(red, green, blue, alpha);
  },
  { deep: true, immediate: true },
);

watch(
  () => disabledAlpha,
  (disabled) => {
    if (disabled) {
      currentMode.value = "rgb";
      if (model.value) {
        model.value = { ...model.value, alpha: 1 };
      }
    }
  },
);
</script>

<template>
  <div class="color-picker-wrapper mx-auto rounded-lg overflow-hidden border">
    <v-color-picker
      data-testid="colorPicker"
      :model-value="vuetifyColor"
      @update:model-value="onPickerUpdate"
      mode="rgba"
      flat
      canvas-height="75"
      hide-eye-dropper
      hide-inputs
      :disabled-alpha="disabledAlpha"
      width="220"
      class="mx-auto bg-transparent"
    />

    <div class="color-picker-controls pa-2 pt-0">
      <div class="d-flex align-center justify-space-between px-1 mb-1">
        <div class="d-flex align-center ga-1">
          <span
            class="text-caption font-weight-medium text-uppercase text-medium-emphasis"
            style="font-size: 0.68rem"
          >
            {{ currentMode }}
          </span>
          <v-btn
            v-if="!disabledAlpha"
            icon
            density="compact"
            variant="text"
            size="small"
            @click="toggleMode"
            v-tooltip="'Swap mode (RGB / RGBA)'"
          >
            <v-icon icon="mdi-swap-horizontal" size="16" />
          </v-btn>
        </div>

        <v-btn
          data-testid="copyColorBtn"
          icon
          density="compact"
          variant="text"
          size="small"
          @click="copyToClipboard"
          v-tooltip="'Copy to clipboard'"
        >
          <v-icon
            :icon="copied ? 'mdi-check' : 'mdi-content-copy'"
            size="14"
            :color="copied ? 'success' : undefined"
          />
        </v-btn>
      </div>

      <input
        data-testid="colorInput"
        v-model="colorInputText"
        class="color-input-field"
        type="text"
        spellcheck="false"
        autocomplete="off"
        @paste="onInputPaste"
        @change="onInputCommit"
        @keydown.enter.prevent="onInputCommit"
      />
    </div>
  </div>
</template>

<style scoped>
.color-picker-wrapper {
  width: 220px;
  background-color: rgba(33, 33, 33, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  outline: none;
}

:deep(.v-color-picker) {
  background-color: transparent !important;
  box-shadow: none !important;
}

:deep(.v-color-picker-canvas),
:deep(.v-color-picker__preview),
:deep(.v-color-picker__controls) {
  box-shadow: none !important;
}

:deep(.v-color-picker__controls) {
  padding: 4px 8px 0 !important;
}

:deep(.v-color-picker__dot) {
  width: 18px !important;
  height: 18px !important;
  box-shadow: none !important;
}

:deep(.v-color-picker__preview) {
  margin-bottom: 0 !important;
}

.color-input-field {
  width: 100%;
  box-sizing: border-box;
  padding: 6px 10px;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid transparent;
  border-radius: 6px;
  outline: none;
  color: inherit;
  font-size: 0.82rem;
  font-family: monospace;
  letter-spacing: 0.5px;
  text-align: center;
  transition: border-color 0.15s ease;
}

.color-input-field:focus {
  border-color: rgba(255, 255, 255, 0.3);
}
</style>
