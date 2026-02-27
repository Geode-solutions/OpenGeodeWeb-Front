<script setup>
  import DragAndDrop from "@ogw_front/components/DragAndDrop"
  import { useGeodeStore } from "@ogw_front/stores/geode"

  const emit = defineEmits(["files_uploaded", "decrement_step", "reset_values"])

  const { multiple, accept, files, auto_upload, mini } = defineProps({
    multiple: { type: Boolean, required: true },
    accept: { type: String, required: true },
    files: { type: Array, required: false, default: [] },
    auto_upload: { type: Boolean, required: false, default: false },
    mini: { type: Boolean, required: false, default: false },
  })

  const geodeStore = useGeodeStore()

  const internal_files = ref(files)
  const loading = ref(false)
  const files_uploaded = ref(false)

  const toggle_loading = useToggle(loading)

  function processSelectedFiles(files) {
    if (multiple) {
      internal_files.value = [...internal_files.value, ...files]
    } else {
      internal_files.value = [files[0]]
    }
  }

  function removeFile(index) {
    internal_files.value.splice(index, 1)
    if (internal_files.value.length === 0) {
      files_uploaded.value = false
      emit("files_uploaded", [])
    }
  }

  async function upload_files() {
    toggle_loading()
    const promise_array = internal_files.value.map((file) =>
      geodeStore.upload(file),
    )
    await Promise.all(promise_array)
    files_uploaded.value = true
    emit("files_uploaded", internal_files.value)

    toggle_loading()
  }

  if (files.length > 0) {
    internal_files.value = files
    if (auto_upload) {
      upload_files()
    }
  }

  watch(
    () => files,
    (newVal) => {
      internal_files.value = newVal
    },
    { deep: true },
  )

  watch(internal_files, (value) => {
    files_uploaded.value = false
    if (auto_upload && value.length > 0) {
      upload_files()
    }
  })
</script>

<template>
  <DragAndDrop
    :multiple="multiple"
    :accept="accept"
    :loading="loading"
    :show-extensions="false"
    @files-selected="processSelectedFiles"
  />

  <v-card-text v-if="internal_files.length" class="mt-6">
    <v-sheet class="d-flex align-center mb-4" color="transparent">
      <v-icon icon="mdi-file-check" class="mr-3" color="primary" size="24" />
      <span class="text-subtitle-1 font-weight-bold text-white">
        Selected Files
      </span>
      <v-chip
        size="small"
        class="ml-3 bg-white-opacity-10"
        color="white"
        variant="flat"
      >
        {{ internal_files.length }}
      </v-chip>
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
    class="mt-6 pa-0"
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
