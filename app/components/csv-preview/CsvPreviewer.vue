<script setup>
import { useToggle } from "@vueuse/core";
import CsvSettings from "./CsvSettings.vue";
import CsvTable from "./CsvTable.vue";

const props = defineProps({
  file: { type: Object, required: true },
  modelValue: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "confirm"]);

const separator = ref(",");
const skipRows = ref(0);

const xCol = ref(null);
const yCol = ref(null);
const zCol = ref(null);

const rawContent = ref("");
const previewRows = ref([]);
const previewHeaders = ref([]);
const loading = ref(false);
const toggleLoading = useToggle(loading);

const autoDetectSeparator = (content) => {
  const lines = content.slice(0, 1000).split(/\r?\n/).slice(0, 5);
  const candidates = [",", ";", "\t", "|"];
  let best = ",";
  let maxCount = -1;

  candidates.forEach((c) => {
    const counts = lines.map((l) => l.split(c).length);
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    const variance = counts.reduce((a, b) => a + (b - avg) ** 2, 0) / counts.length;

    if (avg > 1.5 && variance < 0.5 && avg > maxCount) {
      maxCount = avg;
      best = c;
    }
  });
  return best;
};

const readAndParse = async () => {
  if (!props.file) return;
  toggleLoading(true);

  const reader = new FileReader();
  reader.onload = (e) => {
    rawContent.value = e.target.result;
    if (!separator.value || separator.value === ",") {
      separator.value = autoDetectSeparator(rawContent.value);
    }
    parseContent();
    toggleLoading(false);
  };
  reader.onerror = () => {
    toggleLoading(false);
  };
  reader.readAsText(props.file, "UTF-8");
};

const parseContent = () => {
  if (!rawContent.value) return;

  const allLines = rawContent.value.split(/\r?\n/).filter((l) => l.trim() !== "");
  const effectiveLines = allLines.slice(skipRows.value);

  const splitLine = (line) => {
    if (!separator.value) return [line];
    const result = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i += 1) {
      const char = line[i];
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
  };

  const parsedAll = effectiveLines.map(splitLine);

  if (parsedAll.length > 0) {
    const rawHeaders = parsedAll[0];
    previewHeaders.value = rawHeaders.map((h, i) => ({
      title: h || `Column ${i + 1}`,
      key: `col${i}`,
      align: "start",
      sortable: true,
    }));

    previewRows.value = parsedAll
      .slice(1, 101)
      .map((row) => {
        const obj = {};
        row.forEach((cell, i) => {
          obj[`col${i}`] = cell;
        });
        return obj;
      });
  } else {
    previewHeaders.value = [];
    previewRows.value = [];
  }
};

const computedResult = computed(() => {
  return {
    separator: separator.value,
    skipRows: skipRows.value,
    coordinateMapping: {
      x: previewHeaders.value.findIndex((h) => h.key === xCol.value),
      y: previewHeaders.value.findIndex((h) => h.key === yCol.value),
      z: previewHeaders.value.findIndex((h) => h.key === zCol.value),
    },
  };
});

watch([separator, skipRows], () => {
  parseContent();
  xCol.value = null;
  yCol.value = null;
  zCol.value = null;
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) readAndParse();
  },
  { immediate: true },
);

watch(
  () => props.file,
  (newFile) => {
    if (newFile && props.modelValue) readAndParse();
  },
);

const onConfirm = () => {
  emit("confirm", computedResult.value);
  emit("update:modelValue", false);
};
</script>

<template>
  <v-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    max-width="1200px"
  >
    <v-card class="glass-ui rounded-xl overflow-hidden border-opacity-10" color="grey-darken-4">
      <v-toolbar color="transparent" flat class="px-4">
        <v-icon icon="mdi-file-delimited-outline" color="primary" class="mr-3" />
        <v-toolbar-title class="text-h6 font-weight-bold text-white">
          CSV Previewer & Configuration
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" color="white" @click="emit('update:modelValue', false)" />
      </v-toolbar>

      <v-divider class="border-opacity-10" />

      <div class="previewer-grid">
        <CsvSettings
          v-model:separator="separator"
          v-model:skip-rows="skipRows"
          v-model:x-col="xCol"
          v-model:y-col="yCol"
          v-model:z-col="zCol"
          :headers="previewHeaders"
        />

        <CsvTable
          :headers="previewHeaders"
          :rows="previewRows"
          :loading="loading"
          :x-col="xCol"
          :y-col="yCol"
          :z-col="zCol"
          :separator="separator"
          :skip-rows="skipRows"
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
          :disabled="!previewHeaders.length"
        >
          Confirm & Convert to JSON
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
