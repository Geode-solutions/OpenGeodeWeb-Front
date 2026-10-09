<script setup lang="ts">
import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";

import { matchExpectedFiles, uploadPath } from "@ogw_front/utils/upload_path";
import DragAndDrop from "@ogw_front/components/DragAndDrop.vue";
import FetchingData from "@ogw_front/components/FetchingData.vue";
import FileUploader from "@ogw_front/components/FileUploader.vue";
import { useBackStore } from "@ogw_front/stores/back";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

// Files carry extra app-specific bookkeeping fields once picked up here.
type UploadFile = File & { isConfigured?: boolean; relativePath?: string };
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

const {
  multiple,
  geodeObjectType,
  filenames,
  files = [],
  timeSeries = false,
} = defineProps<Props>();

const accept = ref<string>("");
const loading = ref<boolean>(false);
const has_missing_files = ref<boolean>(false);
const mandatory_files = ref<string[]>([]);
const additional_files = ref<string[]>([]);
const toggle_loading = useToggle(loading);
const uploading = ref<boolean>(false);

function files_uploaded_event(value: UploadFile[]): void {
  emit("update_values", { additional_files: value });
  emit("increment_step");
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

// Time series: uploads the missing files found in the selected folder, then the files they
// Reference in turn, until nothing is missing. The folder layout does not matter.
async function upload_missing_from(
  folder_files: UploadFile[],
  uploaded: UploadFile[],
): Promise<void> {
  const expected = [...mandatory_files.value, ...additional_files.value];
  const match = matchExpectedFiles(
    folder_files.map((file) => uploadPath(file)),
    expected,
  );
  if (match.status === "ambiguous") {
    useFeedbackStore().add_warning(
      `Several matching files for ${match.path}, select a more specific folder`,
    );
    return;
  }
  const found = expected.flatMap((expected_path, index) => {
    const file = folder_files[match.indices[index] ?? -1];
    return file && !uploaded.includes(file)
      ? [Object.assign(file, { relativePath: expected_path })]
      : [];
  });
  if (found.length === 0) {
    useFeedbackStore().add_warning(`The selected folder does not contain: ${expected.join(", ")}`);
    return;
  }
  const backStore = useBackStore();
  await Promise.all(found.map((file) => backStore.upload(file)));
  emit("update_values", { additional_files: [...uploaded, ...found] });
  await missing_files();
  if (has_missing_files.value) {
    await upload_missing_from(folder_files, [...uploaded, ...found]);
  }
}

async function upload_folder(folder_files: UploadFile[]): Promise<void> {
  uploading.value = true;
  try {
    await upload_missing_from(folder_files, []);
  } finally {
    uploading.value = false;
  }
}

function warn_folder_read_error(message: string): void {
  useFeedbackStore().add_warning(`Could not read the dropped folder: ${message}`);
}

// oxlint-disable-next-line no-top-level-await
await missing_files();
</script>

<template>
  <FetchingData v-if="loading || uploading" />
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
        <DragAndDrop
          v-if="timeSeries"
          directory
          :show-extensions="false"
          @files-selected="upload_folder"
          @folder-read-error="warn_folder_read_error"
        />
        <FileUploader
          v-else
          v-bind="{ multiple, accept, files, autoUpload: false }"
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
