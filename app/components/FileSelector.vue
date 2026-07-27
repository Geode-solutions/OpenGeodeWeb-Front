<script setup>
import FetchingData from "@ogw_front/components/FetchingData";
import FileUploader from "@ogw_front/components/FileUploader";
import { getAllowedFiles } from "@ogw_shared/utils/file";

const emit = defineEmits(["update_values", "increment_step", "decrement_step"]);

const { multiple, files, autoUpload, showOverlay } = defineProps({
  multiple: { type: Boolean, required: true },
  files: { type: Array, default: () => [] },
  autoUpload: { type: Boolean, default: true },
  showOverlay: { type: Boolean, default: true },
});

const internal_files = ref(files);
const internal_auto_upload = ref(autoUpload);
const accept = ref("");
const loading = ref(false);

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

function toggleLoading() {
  useToggle(loading);
}

function files_uploaded_event(value) {
  if (value.length > 0) {
    emit("update_values", { files: value, autoUpload: false });
    emit("increment_step");
  }
}

// oxlint-disable-next-line no-top-level-await
await getAllowedFiles({
  beforeFunction: () => toggleLoading(),
  afterFunction: () => toggleLoading(),
});
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
