<script setup>
  import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { upload_file } from "@ogw_front/utils/upload_file"
  import DragAndDrop from "@ogw_front/components/DragAndDrop"

  const schema = schemas.opengeodeweb_back.upload_file

  const emit = defineEmits(["files_uploaded", "decrement_step", "reset_values"])

  const props = defineProps({
    multiple: { type: Boolean, required: true },
    accept: { type: String, required: true },
    files: { type: Array, required: false, default: [] },
    auto_upload: { type: Boolean, required: false, default: false },
    mini: { type: Boolean, required: false, default: false },
  })

  const internal_files = ref(props.files)
  const loading = ref(false)
  const files_uploaded = ref(false)

  const toggle_loading = useToggle(loading)

  function processSelectedFiles(files) {
    if (props.multiple) {
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
    var promise_array = []
    for (const file of internal_files.value) {
      const promise = new Promise((resolve, reject) => {
        upload_file(
          { route: schema.$id, file },
          {
            request_error_function: () => {
              reject()
            },
            response_function: () => {
              resolve()
            },
            response_error_function: () => {
              reject()
            },
          },
        )
      })
      promise_array.push(promise)
    }
    await Promise.all(promise_array)
    files_uploaded.value = true
    emit("files_uploaded", internal_files.value)

    toggle_loading()
  }

  if (props.files.length) {
    internal_files.value = props.files
    if (props.auto_upload) {
      upload_files()
    }
  }

  watch(
    () => props.files,
    (newVal) => {
      internal_files.value = newVal
    },
    { deep: true },
  )

  watch(internal_files, (value) => {
    files_uploaded.value = false
    if (props.auto_upload && value.length > 0) {
      upload_files()
    }
  })
</script>

<template>
  <DragAndDrop
    :multiple="props.multiple"
    :accept="props.accept"
    :loading="loading"
    :show-extensions="false"
    @files-selected="processSelectedFiles"
  />

  <v-card-text v-if="internal_files.length" class="mt-6">
    <v-sheet class="d-flex align-center mb-4" color="transparent">
      <v-icon icon="mdi-file-check" class="mr-3" color="success" size="24" />
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
        class="font-weight-medium glass-panel border-opacity-10 px-4"
        style="background: rgba(255, 255, 255, 0.05) !important"
        @click:close="removeFile(index)"
      >
        <v-icon start size="18" color="success">mdi-file-outline</v-icon>
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
    v-if="!props.auto_upload && internal_files.length"
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
