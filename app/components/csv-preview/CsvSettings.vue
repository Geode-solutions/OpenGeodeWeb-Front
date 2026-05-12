<script setup>
const { separator, skipRows, xCol, yCol, zCol, headers } = defineProps({
  separator: { type: String, required: true },
  skipRows: { type: Number, required: true },
  xCol: { type: String, default: undefined },
  yCol: { type: String, default: undefined },
  zCol: { type: String, default: undefined },
  headers: { type: Array, default: () => [] },
});

const emit = defineEmits([
  "update:separator",
  "update:skipRows",
  "update:xCol",
  "update:yCol",
  "update:zCol",
]);

const separators = [
  { title: "Comma (,)", value: "," },
  { title: "Semicolon (;)", value: ";" },
  { title: "Tab (\\t)", value: "\t" },
  { title: "Pipe (|)", value: "|" },
];

const internalSeparator = computed({
  get: () => separator,
  set: (value) => emit("update:separator", value),
});

const internalSkipRows = computed({
  get: () => skipRows,
  set: (value) => emit("update:skipRows", value),
});

const internalXCol = computed({
  get: () => xCol,
  set: (value) => emit("update:xCol", value),
});

const internalYCol = computed({
  get: () => yCol,
  set: (value) => emit("update:yCol", value),
});

const internalZCol = computed({
  get: () => zCol,
  set: (value) => emit("update:zCol", value),
});
</script>

<template>
  <div class="pa-6 overflow-y-auto border-e border-opacity-10 bg-white-opacity-5">
    <div class="text-overline mb-4 text-primary font-weight-bold">Parser Settings</div>

    <v-select
      v-model="internalSeparator"
      :items="separators"
      label="Separator"
      variant="outlined"
      density="compact"
      class="mb-4"
      rounded="lg"
    />

    <v-text-field
      v-if="!separators.find((s) => s.value === separator)"
      v-model="internalSeparator"
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
      v-model.number="internalSkipRows"
      type="number"
      label="Skip Rows"
      variant="outlined"
      density="compact"
      hint="Number of rows to ignore at the start"
      persistent-hint
      class="mb-6"
      min="0"
      rounded="lg"
    />

    <v-divider class="my-6 border-opacity-10" />

    <div class="text-overline mb-4 text-primary font-weight-bold">Spatial Mapping</div>

    <v-select
      v-model="internalXCol"
      :items="headers"
      item-title="title"
      item-value="key"
      label="X Coordinate Column"
      variant="outlined"
      density="compact"
      prepend-inner-icon="mdi-axis-x-arrow"
      color="light-blue-accent-3"
      class="mb-2"
      clearable
      rounded="lg"
    />

    <v-select
      v-model="internalYCol"
      :items="headers"
      item-title="title"
      item-value="key"
      label="Y Coordinate Column"
      variant="outlined"
      density="compact"
      prepend-inner-icon="mdi-axis-y-arrow"
      color="light-green-accent-3"
      class="mb-2"
      clearable
      rounded="lg"
    />

    <v-select
      v-model="internalZCol"
      :items="headers"
      item-title="title"
      item-value="key"
      label="Z Coordinate Column"
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
