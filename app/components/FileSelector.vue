<script setup lang="ts">
import type { FileExtension } from "@ogw_front/types/files";
import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_typed_schemas.js";

import FetchingData from "@ogw_front/components/FetchingData.vue";
import FileUploader from "@ogw_front/components/FileUploader.vue";
import { useBackStore } from "@ogw_front/stores/back";

interface Props {
  multiple: boolean;
  files: File[];
  autoUpload: boolean;
  showOverlay: boolean;
  timeSeries: boolean;
}

interface Emits {
  update_values: [values: { files: unknown[]; autoUpload: boolean; time_series?: FileExtension[] }];
  increment_step: [];
  decrement_step: [];
}

const schema = schemas.opengeodeweb_back.allowed_files;

const emit = defineEmits<Emits>();

const { multiple, files, autoUpload, showOverlay, timeSeries } = defineProps<Props>();

const internal_files = ref<File[]>(files);
const internal_auto_upload = ref<boolean>(autoUpload);
const accept = ref<string>("");
const timeSeriesExtensions = ref<FileExtension[]>([]);
const loading = ref<boolean>(false);

watch(
  () => files,
  (val) => {
    internal_files.value = val;
  },
);

watch(
  () => autoUpload,
  (val) => {
    internal_auto_upload.value = val;
  },
);

const toggle_loading = useToggle(loading);

function files_uploaded_event(value: unknown[]): void {
  if (value.length > 0) {
    if (timeSeries) {
      emit("update_values", {
        files: value,
        autoUpload: false,
        time_series: timeSeriesExtensions.value,
      });
    } else {
      emit("update_values", { files: value, autoUpload: false });
    }
    emit("increment_step");
  }
}

async function get_allowed_files(): Promise<void> {
  toggle_loading();
  const backStore = useBackStore();
  const response = await backStore.request({ schema });
  timeSeriesExtensions.value = timeSeries ? response.time_series_extensions : [];
  accept.value = [...response.data_extensions, ...timeSeriesExtensions.value]
    .map((extension) => `.${extension}`)
    .join(",");
  toggle_loading();
}

// oxlint-disable-next-line no-top-level-await
await get_allowed_files();
</script>

<template>
  <FetchingData v-if="loading" />
  <FileUploader
    v-else
    v-bind="{
      multiple,
      accept,
      files: internal_files,
      autoUpload: internal_auto_upload,
      showOverlay: showOverlay,
    }"
    @files_uploaded="files_uploaded_event"
  />
</template>
