<script setup>
const { separator, headerRow, firstRow, xColumn, yColumn, zColumn, headers } = defineProps({
  separator: { type: String, required: true },
  headerRow: { type: Number, required: true },
  firstRow: { type: Number, required: true },
  xColumn: { type: String, default: undefined },
  yColumn: { type: String, default: undefined },
  zColumn: { type: String, default: undefined },
  headers: { type: Array, default: () => [] },
});

const emit = defineEmits([
  "update:separator",
  "update:headerRow",
  "update:firstRow",
  "update:xColumn",
  "update:yColumn",
  "update:zColumn",
]);

const separators = [
  { title: "Comma (,)", value: "," },
  { title: "Semicolon (;)", value: ";" },
  { title: "Tab (\\t)", value: "\t" },
  { title: "Space ( )", value: " " },
  { title: "Pipe (|)", value: "|" },
  { title: "Custom", value: "custom" },
];

const selectedType = ref(",");
const customValue = ref("");

watch(
  () => separator,
  (newVal) => {
    const predefined = separators.find((sep) => sep.value === newVal && sep.value !== "custom");
    if (predefined) {
      selectedType.value = predefined.value;
    } else {
      selectedType.value = "custom";
      if (customValue.value !== newVal) {
        customValue.value = newVal || "";
      }
    }
  },
  { immediate: true }
);

watch(selectedType, (newVal) => {
  if (newVal === "custom") {
    emit("update:separator", customValue.value);
  } else {
    emit("update:separator", newVal);
  }
});

watch(customValue, (newVal) => {
  if (selectedType.value === "custom") {
    emit("update:separator", newVal);
  }
});

const internalHeaderRow = computed({
  get: () => headerRow,
  set: (value) => emit("update:headerRow", value),
});

const internalFirstRow = computed({
  get: () => firstRow,
  set: (value) => emit("update:firstRow", value),
});

const internalXColumn = computed({
  get: () => xColumn,
  set: (value) => emit("update:xColumn", value),
});

const internalYColumn = computed({
  get: () => yColumn,
  set: (value) => emit("update:yColumn", value),
});

const internalZColumn = computed({
  get: () => zColumn,
  set: (value) => emit("update:zColumn", value),
});
</script>

<template>
  <div class="pa-6 overflow-y-auto border-e border-opacity-10 bg-white-opacity-5">
    <div class="text-overline mb-4 text-primary font-weight-bold">Parser Settings</div>

    <v-select
      v-model="selectedType"
      :items="separators"
      item-title="title"
      item-value="value"
      label="Separator"
      variant="outlined"
      density="compact"
      class="mb-4"
      rounded="lg"
    />

    <v-text-field
      v-if="selectedType === 'custom'"
      v-model="customValue"
      label="Custom Separator"
      variant="outlined"
      density="compact"
      placeholder="Enter character"
      class="mb-4"
      rounded="lg"
    />

    <v-divider class="my-6 border-opacity-10" />

    <div class="text-overline mb-4 text-primary font-weight-bold">Row Configuration</div>

    <v-text-field
      v-model.number="internalHeaderRow"
      type="number"
      label="Header Row"
      variant="outlined"
      density="compact"
      hint="Index of the row containing headers"
      persistent-hint
      class="mb-4"
      min="0"
      rounded="lg"
    />

    <v-text-field
      v-model.number="internalFirstRow"
      type="number"
      label="First Data Row"
      variant="outlined"
      density="compact"
      hint="Index of the first row containing data"
      persistent-hint
      class="mb-6"
      min="0"
      rounded="lg"
    />

    <v-divider class="my-6 border-opacity-10" />

    <div class="text-overline mb-4 text-primary font-weight-bold">Spatial Mapping</div>

    <v-select
      v-model="internalXColumn"
      :items="headers"
      item-title="title"
      item-value="key"
      label="X Column"
      variant="outlined"
      density="compact"
      prepend-inner-icon="mdi-axis-x-arrow"
      color="light-blue-accent-3"
      class="mb-2"
      clearable
      rounded="lg"
    />

    <v-select
      v-model="internalYColumn"
      :items="headers"
      item-title="title"
      item-value="key"
      label="Y Column"
      variant="outlined"
      density="compact"
      prepend-inner-icon="mdi-axis-y-arrow"
      color="light-green-accent-3"
      class="mb-2"
      clearable
      rounded="lg"
    />

    <v-select
      v-model="internalZColumn"
      :items="headers"
      item-title="title"
      item-value="key"
      label="Z Column"
      variant="outlined"
      density="compact"
      prepend-inner-icon="mdi-axis-z-arrow"
      color="red-accent-3"
      class="mb-8"
      clearable
      rounded="lg"
    />
    <div class="pb-12" />
  </div>
</template>

<style scoped>
.bg-white-opacity-5 {
  background: rgba(255, 255, 255, 0.03);
}
</style>
