<script setup>
import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json";

import FetchingData from "@ogw_front/components/FetchingData";
import FileUploader from "@ogw_front/components/FileUploader";
import { useBackStore } from "@ogw_front/stores/back";

const schema = schemas.opengeodeweb_back.allowed_files;

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

const toggle_loading = useToggle(loading);

function files_uploaded_event(value) {
  if (value.length > 0) {
    emit("update_values", { files: value, autoUpload: false });
    emit("increment_step");
  }
}

async function get_allowed_files() {
  toggle_loading();
  const backStore = useBackStore();
  const response = await backStore.request({ schema });
  accept.value = response.extensions.map((extension) => `.${extension}`).join(",");
  toggle_loading();
}

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
