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
interface FileMissingFiles {
  filename: string;
  mandatory_files: string[];
  additional_files: string[];
}

const schema = schemas.opengeodeweb_back.data_missing_files;
const time_series_schema = schemas.opengeodeweb_back.time_series_missing_files;

interface Emits {
  update_values: [value: { additional_files?: UploadFile[]; skipped_files?: string[] }];
  increment_step: [];
  decrement_step: [];
}

const emit = defineEmits<Emits>();

interface Props {
  multiple: boolean;
  // Filename -> geode object type, each file is checked with its own type (unused for time series)
  geodeObjectTypes?: Record<string, string>;
  filenames: string[];
  files?: UploadFile[];
  timeSeries?: boolean;
}

const {
  multiple,
  geodeObjectTypes = {},
  filenames,
  files = [],
  timeSeries = false,
} = defineProps<Props>();

const accept = ref<string>("");
const loading = ref<boolean>(false);
const has_missing_files = ref<boolean>(false);
const mandatory_files = ref<string[]>([]);
const additional_files = ref<string[]>([]);
const missing_by_file = ref<FileMissingFiles[]>([]);
// Files left out at the data type step are not checked
const checked_filenames = computed(() =>
  timeSeries ? filenames : filenames.filter((filename) => filename in geodeObjectTypes),
);
// Files whose mandatory files are missing are skipped when the step is skipped
const files_without_mandatory = computed(() =>
  checked_filenames.value.filter(
    (filename) =>
      !missing_by_file.value.some(
        (missing) => missing.filename === filename && missing.mandatory_files.length > 0,
      ),
  ),
);
const can_skip = computed(
  () => missing_by_file.value.length > 0 && files_without_mandatory.value.length > 0,
);
const toggle_loading = useToggle(loading);
const uploading = ref<boolean>(false);

function files_uploaded_event(value: UploadFile[]): void {
  emit("update_values", { additional_files: value, skipped_files: [] });
  emit("increment_step");
}

function skip_step(): void {
  const skipped_files = checked_filenames.value.filter(
    (filename) => !files_without_mandatory.value.includes(filename),
  );
  emit("update_values", { skipped_files });
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
  missing_by_file.value = [];
  const backStore = useBackStore();

  const promise_array = checked_filenames.value.map((filename): Promise<FilePlan> => {
    if (isCsvFile(filename)) {
      return Promise.resolve({
        has_missing_files: false,
        mandatory_files: [],
        additional_files: [],
      });
    }
    if (timeSeries) {
      return backStore.request({ schema: time_series_schema, params: { filename } });
    }
    const params = { geode_object_type: geodeObjectTypes[filename] ?? "", filename };
    return backStore.request({ schema, params });
  });
  const values = await Promise.all(promise_array);
  for (const [index, value] of values.entries()) {
    if (value.has_missing_files) {
      has_missing_files.value = true;
      missing_by_file.value.push({
        filename: checked_filenames.value[index] ?? "",
        mandatory_files: value.mandatory_files,
        additional_files: value.additional_files,
      });
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
    emit("update_values", { skipped_files: [] });
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
    <template v-if="checked_filenames.length > 1">
      <div v-for="missing in missing_by_file" :key="missing.filename" class="mb-2">
        <v-row align="center">
          <p class="pa-1 font-weight-bold">{{ missing.filename }}</p>
          <v-chip
            v-if="missing.mandatory_files.length && files_without_mandatory.length"
            class="ma-1"
            color="warning"
            size="small"
          >
            Skipped if mandatory files are not added
          </v-chip>
        </v-row>
        <v-row v-if="missing.mandatory_files.length" align="center">
          <v-col cols="auto" class="pa-0">
            <v-icon color="warning" icon="mdi-file-document-alert-outline" />
          </v-col>
          <p class="pa-1">Mandatory files:</p>
          <v-col v-for="mandatory_file in missing.mandatory_files" cols="auto" class="pa-0">
            <v-chip>{{ mandatory_file }}</v-chip>
          </v-col>
        </v-row>
        <v-row v-if="missing.additional_files.length" align="center">
          <v-col cols="auto" class="pa-0">
            <v-icon color="accent" icon="mdi-file-document-plus-outline" />
          </v-col>
          <p class="pa-1">Additional files:</p>
          <v-col v-for="additional_file in missing.additional_files" cols="auto" class="pa-0">
            <v-chip>{{ additional_file }}</v-chip>
          </v-col>
        </v-row>
      </div>
    </template>
    <v-row v-else-if="mandatory_files.length" align="center">
      <v-col cols="auto" class="pa-0">
        <v-icon color="warning" icon="mdi-file-document-alert-outline" />
      </v-col>
      <p class="pa-1">Mandatory files:</p>
      <v-col v-for="mandatory_file in mandatory_files" cols="auto" class="pa-0">
        <v-chip>{{ mandatory_file }}</v-chip>
      </v-col>
    </v-row>
    <v-row v-if="!(checked_filenames.length > 1) && additional_files.length" align="center">
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
      <v-col v-if="can_skip" cols="auto">
        <v-btn @click="skip_step" color="warning" data-testid="skipMissingFilesButton">
          Skip step
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
