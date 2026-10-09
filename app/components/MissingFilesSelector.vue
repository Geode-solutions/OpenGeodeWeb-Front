<script setup lang="ts">
import {
  type UploadFile,
  alignOnExpectedFiles,
  joinUploadPath,
  uploadDirectory,
  uploadPath,
} from "@ogw_front/utils/upload_path";
import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";

import FetchingData from "@ogw_front/components/FetchingData.vue";
import FileUploader from "@ogw_front/components/FileUploader.vue";
import { useBackStore } from "@ogw_front/stores/back";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

interface FilePlan {
  has_missing_files: boolean;
  mandatory_files: string[];
  additional_files: string[];
}

const schema = schemas.opengeodeweb_back.missing_files;

interface Emits {
  update_values: [value: { additional_files: UploadFile[] }];
  increment_step: [];
  decrement_step: [];
}

const emit = defineEmits<Emits>();

interface Props {
  multiple: boolean;
  geodeObjectType: string;
  filenames: string[];
  files?: UploadFile[];
  timeSeries?: boolean;
}

const { multiple, geodeObjectType, filenames, files = [], timeSeries = false } = defineProps<Props>();

const accept = ref<string>("");
const loading = ref<boolean>(false);
const has_missing_files = ref<boolean>(false);
const mandatory_files = ref<string[]>([]);
const additional_files = ref<string[]>([]);
const toggle_loading = useToggle(loading);

// Missing files are listed relative to the main file: upload them next to it.
const upload_directory = computed(() =>
  filenames.length === 1 ? uploadDirectory(filenames[0] ?? "") : "",
);

function withUploadPath(file: UploadFile, path: string): UploadFile {
  return Object.assign(file, { relativePath: joinUploadPath(upload_directory.value, path) });
}

// Time series: the user may select any folder above the referenced files, whatever the export tree.
function prepare_files(selected_files: UploadFile[]): UploadFile[] {
  if (!timeSeries) {
    return selected_files.map((file) => withUploadPath(file, uploadPath(file)));
  }
  const alignment = alignOnExpectedFiles(
    selected_files.map((file) => uploadPath(file)),
    [...mandatory_files.value, ...additional_files.value],
  );
  if (alignment.status === "not_found") {
    useFeedbackStore().add_warning("None of the expected files were found in this folder");
    return [];
  }
  if (alignment.status === "ambiguous") {
    useFeedbackStore().add_warning("Several matching exports in this folder, select a more specific one");
    return [];
  }
  return selected_files.flatMap((file, index) => {
    const aligned = alignment.paths[index];
    return aligned === undefined ? [] : [withUploadPath(file, aligned)];
  });
}

function isCsvFile(filename: string): boolean {
  return filename.toLowerCase().endsWith(".csv") || filename.toLowerCase().endsWith(".csv.json");
}

async function missing_files(): Promise<void> {
  toggle_loading();
  has_missing_files.value = false;
  mandatory_files.value = [];
  additional_files.value = [];
  const backStore = useBackStore();

  const promise_array: Promise<FilePlan>[] = filenames.map((filename): Promise<FilePlan> => {
    if (isCsvFile(filename)) {
      return Promise.resolve({
        has_missing_files: false,
        mandatory_files: [],
        additional_files: [],
      });
    }
    const params = timeSeries
      ? { geode_object_type: geodeObjectType, filename, time_series: true }
      : { geode_object_type: geodeObjectType, filename };
    return backStore.request({ schema, params });
  });
  const values = await Promise.all(promise_array);
  for (const value of values) {
    if (value.has_missing_files) {
      has_missing_files.value = true;
    }
    mandatory_files.value = [...mandatory_files.value, ...value.mandatory_files];
    additional_files.value = [...additional_files.value, ...value.additional_files];
  }
  const unconfigured_csvs = files.filter((file) => isCsvFile(file.name) && !file.isConfigured);
  if (unconfigured_csvs.length > 0) {
    has_missing_files.value = true;
    if (accept.value === "") {
      accept.value = ".json";
    }
  }

  if (!has_missing_files.value) {
    emit("increment_step");
  }
  toggle_loading();
}

function files_uploaded_event(value: UploadFile[]): void {
  emit("update_values", { additional_files: value });
  if (timeSeries) {
    // Re-list what is still missing: the next tree level only becomes known once this one is uploaded.
    void missing_files();
    return;
  }
  emit("increment_step");
}

// oxlint-disable-next-line no-top-level-await
await missing_files();
</script>

<template>
  <FetchingData v-if="loading" />
  <v-container v-else-if="has_missing_files">
    <v-row v-if="mandatory_files.length" align="center">
      <v-col cols="auto" class="pa-0">
        <v-icon color="warning" icon="mdi-file-document-alert-outline" />
      </v-col>
      <p class="pa-1">Mandatory files:</p>
      <v-col v-for="mandatory_file in mandatory_files" cols="auto" class="pa-0">
        <v-chip>{{ mandatory_file }}</v-chip>
      </v-col>
    </v-row>
    <v-row v-if="additional_files.length" align="center">
      <v-col cols="auto" class="pa-0">
        <v-icon color="accent" icon="mdi-file-document-plus-outline" />
      </v-col>
      <p class="pa-1">Additional files:</p>
      <v-col v-for="additional_file in additional_files" cols="auto" class="pa-0">
        <v-chip>{{ additional_file }}</v-chip>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <FileUploader
          v-bind="{
            multiple,
            accept,
            files,
            autoUpload: false,
            prepareFiles: prepare_files,
            directory: timeSeries,
          }"
          @files_uploaded="files_uploaded_event"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col v-if="mandatory_files.length === 0 && additional_files.length > 0" cols="auto">
        <v-btn @click="emit('increment_step')" color="warning">Skip step</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
