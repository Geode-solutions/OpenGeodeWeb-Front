<script setup>
import CsvSettings from "./CsvSettings.vue";
import CsvTable from "./CsvTable.vue";
import { useToggle } from "@vueuse/core";

const { file, modelValue } = defineProps({
  file: { type: Object, required: true },
  modelValue: { type: Boolean, default: false },
});

const MAX_CONTENT_SLICE = 1000;
const MAX_LINES_FOR_DETECTION = 5;
const MIN_AVG_COUNT = 1.5;
const MAX_VARIANCE = 0.5;
const PREVIEW_ROWS_LIMIT = 101;

const emit = defineEmits(["update:modelValue", "confirm"]);

const separator = ref(",");
const headerRow = ref(0);
const firstRow = ref(1);

const xColumn = ref(undefined);
const yColumn = ref(undefined);
const zColumn = ref(undefined);

const rawContent = ref("");
const previewRows = ref([]);
const previewHeaders = ref([]);
const loading = ref(false);
const toggleLoading = useToggle(loading);

function autoDetectSeparator(content) {
  const lines = content
    .slice(0, MAX_CONTENT_SLICE)
    .split(/\r?\n/u)
    .slice(0, MAX_LINES_FOR_DETECTION);
  const candidates = [",", ";", "\t", "|", " "];
  let best = ",";
  let maxCount = -1;

  for (const candidate of candidates) {
    const counts = lines.map((line) => line.split(candidate).length);
    const average = counts.reduce((total, count) => total + count, 0) / counts.length;
    const variance =
      counts.reduce((total, count) => total + (count - average) ** 2, 0) / counts.length;

    if (average > MIN_AVG_COUNT && variance < MAX_VARIANCE && average > maxCount) {
      maxCount = average;
      best = candidate;
    }
  }
  return best;
}

function readAndParse() {
  if (!file) {
    return;
  }
  toggleLoading(true);

  const reader = new FileReader();
  reader.addEventListener("load", (event) => {
    rawContent.value = event.target.result;
    if (!separator.value || separator.value === ",") {
      separator.value = autoDetectSeparator(rawContent.value);
    }
    parseContent();
    toggleLoading(false);
  });
  reader.addEventListener("error", () => {
    toggleLoading(false);
  });
  reader.readAsText(file, "utf8");
}

function parseContent() {
  if (!rawContent.value) {
    return;
  }

  const allLines = rawContent.value.split(/\r?\n/u).filter((line) => line.trim() !== "");

  function splitLine(line) {
    if (!separator.value) {
      return [line];
    }
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === separator.value && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headerLine = allLines[headerRow.value];
  const rawHeaders = headerLine ? splitLine(headerLine) : [];

  previewHeaders.value = rawHeaders.map((header, index) => ({
    title: header || `Column ${index + 1}`,
    key: `col${index}`,
    align: "start",
    sortable: true,
  }));

  const dataLines = allLines.slice(firstRow.value, firstRow.value + PREVIEW_ROWS_LIMIT);
  previewRows.value = dataLines.map((line) => {
    const row = splitLine(line);
    const obj = {};
    for (let index = 0; index < row.length; index += 1) {
      obj[`col${index}`] = row[index];
    }
    return obj;
  });
}
const computedResult = computed(() => {
  const xIndex = previewHeaders.value.findIndex((header) => header.key === xColumn.value);
  const yIndex = previewHeaders.value.findIndex((header) => header.key === yColumn.value);
  const zIndex = previewHeaders.value.findIndex((header) => header.key === zColumn.value);

  return {
    firstRow: firstRow.value,
    headerRow: headerRow.value,
    separator: separator.value,
    xColumn: xIndex,
    yColumn: yIndex,
    zColumn: zIndex,
  };
});

const isFormValid = computed(
  () =>
    separator.value !== "" &&
    separator.value !== undefined &&
    headerRow.value !== undefined &&
    firstRow.value !== undefined &&
    xColumn.value !== undefined &&
    yColumn.value !== undefined &&
    zColumn.value !== undefined,
);

watch([separator, headerRow, firstRow], () => {
  parseContent();
  xColumn.value = undefined;
  yColumn.value = undefined;
  zColumn.value = undefined;
});

watch(
  () => modelValue,
  (val) => {
    if (val) {
      readAndParse();
    }
  },
  { immediate: true },
);

watch(
  () => file,
  (newFile) => {
    if (newFile && modelValue) {
      readAndParse();
    }
  },
);

function onConfirm() {
  emit("confirm", computedResult.value);
  emit("update:modelValue", false);
}
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    max-width="1200px"
  >
    <v-card class="glass-ui rounded-xl overflow-hidden border-opacity-10" color="grey-darken-4">
      <v-toolbar color="transparent" flat class="px-4">
        <v-icon icon="mdi-file-table" size="32" color="primary" class="ml-1" />
        <v-toolbar-title class="text-h6 font-weight-bold text-white">
          CSV Previewer & Configuration
        </v-toolbar-title>
        <v-spacer />
        <v-btn
          icon="mdi-close"
          variant="text"
          color="white"
          @click="emit('update:modelValue', false)"
        />
      </v-toolbar>

      <v-divider class="border-opacity-10" />

      <div class="previewer-grid">
        <CsvSettings
          v-model:separator="separator"
          v-model:header-row="headerRow"
          v-model:first-row="firstRow"
          v-model:x-column="xColumn"
          v-model:y-column="yColumn"
          v-model:z-column="zColumn"
          :headers="previewHeaders"
        />

        <CsvTable
          :headers="previewHeaders"
          :rows="previewRows"
          :loading="loading"
          :coordinates="{ x: xColumn, y: yColumn, z: zColumn }"
          :separator="separator"
          :header-row="headerRow"
          :first-row="firstRow"
        />
      </div>

      <v-divider class="border-opacity-10" />

      <v-card-actions class="pa-4 bg-white-opacity-5">
        <v-spacer />
        <v-btn
          variant="text"
          class="text-none px-6"
          color="white"
          @click="emit('update:modelValue', false)"
        >
          Cancel
        </v-btn>
        <v-btn
          variant="flat"
          color="primary"
          class="text-none px-8 rounded-lg font-weight-bold"
          @click="onConfirm"
          :disabled="!previewHeaders.length || !isFormValid"
        >
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.glass-ui {
  background: rgba(30, 30, 30, 0.8) !important;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.previewer-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  height: 70vh;
  overflow: hidden;
}

.bg-white-opacity-5 {
  background: rgba(255, 255, 255, 0.03);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
