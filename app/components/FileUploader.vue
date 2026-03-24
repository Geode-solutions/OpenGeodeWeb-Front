<script setup>
import DragAndDrop from "@ogw_front/components/DragAndDrop";
import GlassCard from "@ogw_front/components/GlassCard";
import { useGeodeStore } from "@ogw_front/stores/geode";

const emit = defineEmits(["files_uploaded", "decrement_step", "reset_values"]);

const { multiple, accept, files, auto_upload, mini, show_overlay } = defineProps({
  multiple: { type: Boolean, required: true },
  accept: { type: String, required: true },
  files: { type: Array, required: false, default: [] },
  auto_upload: { type: Boolean, required: false, default: false },
  mini: { type: Boolean, required: false, default: false },
  show_overlay: { type: Boolean, required: false, default: true },
});

const geodeStore = useGeodeStore();

const internal_files = ref(files);
const loading = ref(false);
const files_uploaded = ref(false);
const dragAndDropRef = ref(null);

const toggle_loading = useToggle(loading);

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
  toggle_loading();
  const promise_array = internal_files.value.map((file) =>
    geodeStore.upload(file),
  );
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
    upload_files();
  }
});
</script>

<template>
  <DragAndDrop
    ref="dragAndDropRef"
    :multiple="multiple"
    :accept="accept"
    :loading="loading"
    :show-extensions="false"
    :inline="false"
    :show-overlay="show_overlay"
    @files-selected="processSelectedFiles"
  />

  <v-hover
    v-if="!internal_files.length"
    v-slot="{ isHovering, props: hoverProps }"
  >
    <GlassCard
      v-bind="hoverProps"
      class="text-center cursor-pointer glass-ui border-dashed pa-12 mb-0 transition-swing"
      :class="{ 'elevation-12 border-opacity-40': isHovering }"
      variant="ui"
      @click="dragAndDropRef?.triggerFileDialog"
    >
      <v-sheet
        class="mx-auto mb-6 d-flex align-center justify-center transition-swing"
        :color="isHovering ? 'primary' : 'rgba(255, 255, 255, 0.05)'"
        rounded="circle"
        width="80"
        height="80"
      >
        <v-icon
          :icon="loading ? 'mdi-loading' : 'mdi-plus'"
          size="40"
          :color="isHovering ? 'white' : 'primary'"
          :class="{ rotating: loading }"
        />
      </v-sheet>

      <div class="text-h6 font-weight-bold text-white mb-1">Select files</div>
      <div class="text-body-2 text-white opacity-60">
        Or drag and drop them anywhere to import them
      </div>
    </GlassCard>
  </v-hover>

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
        <v-icon start size="18" color="primary">mdi-file-outline</v-icon>
        <span class="text-white">{{ file.name }}</span>
        <template #close>
          <v-icon size="16" class="ml-2 opacity-60 hover-opacity-100"
            >mdi-close-circle</v-icon
          >
        </template>
      </v-chip>
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
      Upload {{ internal_files.length }} file<span
        v-if="internal_files.length > 1"
        >s</span
      >
    </v-btn>
  </v-card-actions>
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

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.custom-upload-btn {
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(var(--v-theme-primary), 0.3);
}
</style>
