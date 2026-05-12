<script setup>
import { useGeodeStore } from "@ogw_front/stores/geode";

import CsvPreviewer from "@ogw_front/components/csv-preview/CsvPreviewer";
import DragAndDrop from "@ogw_front/components/DragAndDrop";

const emit = defineEmits(["files_uploaded"]);

const { multiple, accept, files, auto_upload, showOverlay } = defineProps({
  multiple: { type: Boolean, default: false },
  accept: { type: String, default: "" },
  files: { type: Array, default: () => [] },
  auto_upload: { type: Boolean, default: true },
  showOverlay: { type: Boolean, default: false },
});

const geodeStore = useGeodeStore();
const dragAndDropRef = ref(undefined);
const internal_files = ref([...files]);
const csv_dialog = ref(false);
const current_csv_file = ref(undefined);
const current_csv_index = ref(-1);
const loading = ref(false);

function isCsv(file) {
  return file.name.toLowerCase().endsWith(".csv");
}

function openCsvPreviewer(file, index) {
  current_csv_file.value = file;
  current_csv_index.value = index;
  csv_dialog.value = true;
}

function onCsvConfirm(result) {
  const json_content = JSON.stringify(result, undefined, 2);
  const base_name = current_csv_file.value.name.slice(
    0,
    current_csv_file.value.name.lastIndexOf("."),
  );
  const json_filename = `${base_name}.json`;

  const blob = new Blob([json_content], { type: "application/json" });
  const json_file = new File([blob], json_filename, {
    type: "application/json",
  });

  current_csv_file.value.isConfigured = true;
  internal_files.value = [...internal_files.value, json_file];
  csv_dialog.value = false;
}

function processSelectedFiles(selected_files) {
  if (multiple) {
    internal_files.value = [...internal_files.value, ...selected_files];
  } else {
    internal_files.value = [selected_files[0]];
  }
}

function removeFile(index) {
  const fileToRemove = internal_files.value[index];
  if (isCsv(fileToRemove)) {
    const base_name = fileToRemove.name.slice(
      0,
      fileToRemove.name.lastIndexOf("."),
    );
    const sidecarName = `${base_name}.json`;
    internal_files.value = internal_files.value.filter(
      (file, idx) => idx !== index && file.name !== sidecarName,
    );
  } else {
    internal_files.value.splice(index, 1);
  }
}

async function upload_files() {
  loading.value = true;
  const promise_array = internal_files.value.map((file) =>
    geodeStore.upload(file),
  );
  await Promise.all(promise_array);
  loading.value = false;
  emit("files_uploaded", internal_files.value);
}

watch(
  () => internal_files.value,
  async (newFiles) => {
    const csvFiles = newFiles.filter(isCsv);
    const unconfiguredCsv = csvFiles.find((file) => !file.isConfigured);

    if (unconfiguredCsv) {
      openCsvPreviewer(
        unconfiguredCsv,
        internal_files.value.indexOf(unconfiguredCsv),
      );
      return;
    }

    const allConfigured = newFiles.every(
      (file) => !isCsv(file) || file.isConfigured,
    );

    if (auto_upload && allConfigured && newFiles.length > 0) {
      await upload_files();
    }
  },
  { deep: true },
);

watch(
  () => files,
  (newVal) => {
    internal_files.value = [...newVal];
  },
  { deep: true },
);
</script>

<template>
  <DragAndDrop
    v-if="!internal_files.length"
    ref="dragAndDropRef"
    :multiple
    :accept
    :loading
    :show-extensions="false"
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
      <span class="text-subtitle-1 font-weight-bold text-white">
        Selected files
      </span>
      <v-chip
        size="small"
        class="ml-3 bg-white-opacity-10"
        color="white"
        variant="flat"
      >
        {{
          internal_files.filter((file) => !file.name.endsWith(".json")).length
        }}
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
      <template v-for="(file, index) in internal_files" :key="index">
        <v-chip
          v-if="!file.name.endsWith('.json')"
          closable
          size="default"
          color="white"
          variant="outlined"
          class="font-weight-medium glass-ui border-opacity-10 px-4"
          style="background: rgba(255, 255, 255, 0.05) !important"
          @click:close="removeFile(index)"
        >
          <v-icon
            start
            size="18"
            :color="isCsv(file) && file.isConfigured ? 'success' : 'primary'"
          >
            {{
              isCsv(file)
                ? file.isConfigured
                  ? "mdi-file-check"
                  : "mdi-file-delimited"
                : "mdi-file-outline"
            }}
          </v-icon>
          <span class="text-white">{{ file.displayName || file.name }}</span>

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
            <v-icon size="16" class="ml-2 opacity-60 hover-opacity-100"
              >mdi-close-circle</v-icon
            >
          </template>
        </v-chip>
      </template>
    </v-sheet>
  </v-card-text>

  <v-card-actions
    v-if="!auto_upload && internal_files.length"
    class="mt-8 pa-0"
  >
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
      Upload
      {{ internal_files.filter((file) => !file.name.endsWith(".json")).length }}
      file<span
        v-if="
          internal_files.filter((file) => !file.name.endsWith('.json')).length >
          1
        "
        >s</span
      >
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
.glass-ui {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(10px);
}
.hover-opacity-100:hover {
  opacity: 1 !important;
}
.pulse-animation {
  animation: pulse 2s infinite;
}
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-primary), 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(var(--v-theme-primary), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--v-theme-primary), 0);
  }
}
</style>
