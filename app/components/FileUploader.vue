<script setup>
import { useGeodeStore } from "@ogw_front/stores/geode";
import { useTemplateRef } from "vue";

import DragAndDrop from "@ogw_front/components/DragAndDrop";
import CsvPreviewer from "@ogw_front/components/csv-preview/CsvPreviewer";

const emit = defineEmits(["files_uploaded", "decrement_step", "reset_values"]);

const {
  multiple,
  accept,
  files,
  auto_upload,
  mini,
  show_overlay: showOverlay,
  allow_csv_config: allowCsvConfig,
} = defineProps({
  multiple: { type: Boolean, required: true },
  accept: { type: String, required: true },
  files: { type: Array, required: false, default: [] },
  auto_upload: { type: Boolean, required: false, default: false },
  mini: { type: Boolean, required: false, default: false },
  show_overlay: { type: Boolean, required: false, default: true },
  allow_csv_config: { type: Boolean, required: false, default: false },
});

const geodeStore = useGeodeStore();

const internal_files = ref(files);
const loading = ref(false);
const files_uploaded = ref(false);
const dragAndDropRef = useTemplateRef("dragAndDropRef");

const csv_dialog = ref(false);
const current_csv_file = ref(null);
const current_csv_index = ref(-1);

const toggle_loading = useToggle(loading);

function isCsv(file) {
  return allowCsvConfig && file.name.toLowerCase().endsWith(".csv");
}

function openCsvPreviewer(file, index) {
  current_csv_file.value = file;
  current_csv_index.value = index;
  csv_dialog.value = true;
}

function onCsvConfirm(result) {
  const json_content = JSON.stringify(result, null, 2);
  const blob = new Blob([json_content], { type: "application/json" });
  const json_filename = `${current_csv_file.value.name}.json`;
  const json_file = new File([blob], json_filename, {
    type: "application/json",
  });

  // Keep original CSV and append JSON config file
  internal_files.value.push(json_file);
  csv_dialog.value = false;

  // Mark CSV as configured (for UI purposes)
  current_csv_file.value.isConfigured = true;
}

function processSelectedFiles(selected_files) {
  if (multiple) {
    internal_files.value = [...internal_files.value, ...selected_files];
  } else {
    internal_files.value = [selected_files[0]];
  }
}

function removeFile(index) {
  internal_files.value.splice(index, 1);
  if (internal_files.value.length === 0) {
    files_uploaded.value = false;
    emit("files_uploaded", []);
  }
}

async function upload_files() {
  const hasUnconfiguredCsv = internal_files.value.some((file) => isCsv(file) && !file.isConfigured);
  if (hasUnconfiguredCsv) {
    const index = internal_files.value.findIndex((file) => isCsv(file) && !file.isConfigured);
    openCsvPreviewer(internal_files.value[index], index);
    return;
  }

  // Dev-only: download config JSON files
  internal_files.value.forEach((file) => {
    if (file.name.endsWith(".csv.json")) {
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  });

  toggle_loading();
  const promise_array = internal_files.value.map((file) => geodeStore.upload(file));
  await Promise.all(promise_array);
  files_uploaded.value = true;
  emit("files_uploaded", internal_files.value);

  toggle_loading();
}

if (files.length > 0) {
  internal_files.value = files;
  if (auto_upload) {
    upload_files();
  }
}

watch(
  () => files,
  (newVal) => {
    internal_files.value = newVal;
  },
  { deep: true },
);

watch(internal_files, (value) => {
  files_uploaded.value = false;
  if (auto_upload && value.length > 0) {
    const hasUnconfiguredCsv = value.some((file) => isCsv(file));
    if (!hasUnconfiguredCsv) {
      upload_files();
    }
  }
});
</script>

<template>
  <DragAndDrop
    v-if="!internal_files.length"
    ref="dragAndDropRef"
    :multiple
    :accept
    :loading
    :show-extensions="false"
    :inline="true"
    :show-overlay="showOverlay"
    :texts="{
      idle: 'Select files',
      drop: 'Drop files here',
      loading: 'Loading...',
    }"
    @files-selected="processSelectedFiles"
  />

  <DragAndDrop
    v-else
    ref="dragAndDropRef"
    :multiple
    :accept
    :loading
    :show-extensions="false"
    :inline="false"
    :show-overlay="showOverlay"
    @files-selected="processSelectedFiles"
  />

  <v-card-text v-if="internal_files.length" class="mt-6 pa-0">
    <v-sheet class="d-flex align-center mb-4" color="transparent">
      <v-icon icon="mdi-file-check" class="mr-3" color="primary" size="24" />
      <span class="text-subtitle-1 font-weight-bold text-white"> Selected files </span>
      <v-chip size="small" class="ml-3 bg-white-opacity-10" color="white" variant="flat">
        {{ internal_files.length }}
      </v-chip>
      <v-spacer />
      <v-btn
        v-if="multiple"
        variant="text"
        color="white"
        size="small"
        class="text-none opacity-60"
        prepend-icon="mdi-plus"
        @click="dragAndDropRef?.triggerFileDialog"
      >
        Add
      </v-btn>
    </v-sheet>

    <v-sheet class="d-flex flex-wrap ga-2" color="transparent">
      <v-chip
        v-for="(file, index) in internal_files"
        :key="index"
        closable
        size="default"
        color="white"
        variant="outlined"
        class="font-weight-medium glass-ui border-opacity-10 px-4"
        style="background: rgba(255, 255, 255, 0.05) !important"
        @click:close="removeFile(index)"
      >
        <v-icon start size="18" :color="file.name.endsWith('.json') ? 'success' : 'primary'">
          {{ file.name.endsWith(".json") ? "mdi-file-code" : "mdi-file-outline" }}
        </v-icon>
        <span class="text-white">{{ file.name }}</span>

        <v-tooltip v-if="isCsv(file)" text="Configure CSV" location="bottom">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon="mdi-cog"
              size="x-small"
              variant="flat"
              :color="file.isConfigured ? 'success' : 'primary'"
              :class="['ml-2', { 'pulse-animation': !file.isConfigured }]"
              @click.stop="openCsvPreviewer(file, index)"
            />
          </template>
        </v-tooltip>

        <template #close>
          <v-icon size="16" class="ml-2 opacity-60 hover-opacity-100">mdi-close-circle</v-icon>
        </template>
      </v-chip>
    </v-sheet>
  </v-card-text>

  <v-card-actions v-if="!auto_upload && internal_files.length" class="mt-8 pa-0">
    <v-btn
      color="primary"
      variant="flat"
      size="large"
      rounded="xl"
      :loading="loading"
      class="text-none px-6 font-weight-bold custom-upload-btn"
      block
      @click="upload_files"
    >
      <v-icon start size="22">mdi-cloud-upload</v-icon>
      Upload {{ internal_files.length }} file<span v-if="internal_files.length > 1">s</span>
    </v-btn>
  </v-card-actions>

  <CsvPreviewer
    v-if="current_csv_file"
    v-model="csv_dialog"
    :file="current_csv_file"
    @confirm="onCsvConfirm"
  />
</template>

<style scoped>
.border-dashed {
  border: 2px dashed rgba(255, 255, 255, 0.1) !important;
  transition: all 0.3s ease;
}

.border-dashed:hover {
  border-color: rgba(var(--v-theme-primary), 0.4) !important;
  background: rgba(var(--v-theme-primary), 0.02) !important;
}

.custom-upload-btn {
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(var(--v-theme-primary), 0.3);
}

.pulse-animation {
  animation: pulse 2s infinite;
  box-shadow: 0 0 0 0 rgba(var(--v-theme-primary), 0.7);
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(var(--v-theme-primary), 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(var(--v-theme-primary), 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(var(--v-theme-primary), 0);
  }
}
</style>
