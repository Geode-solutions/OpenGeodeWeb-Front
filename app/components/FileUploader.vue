<template>
  <DragAndDrop
    :multiple="props.multiple"
    :accept="props.accept"
    :loading="loading"
    :show-extensions="false"
    @files-selected="processSelectedFiles"
  />

  <div v-if="internal_files.length" class="mt-6">
    <div class="text-subtitle-2 font-weight-bold mb-3 d-flex align-center">
      <v-icon icon="mdi-file-check" class="mr-2" color="primary" />
      Selected Files
      <v-chip size="x-small" class="ml-2" color="primary" variant="flat">
        {{ internal_files.length }}
      </v-chip>
    </div>
    <div class="d-flex flex-wrap gap-2">
      <v-chip
        v-for="(file, index) in internal_files"
        :key="index"
        closable
        size="small"
        color="primary"
        variant="tonal"
        class="font-weight-medium"
        @click:close="removeFile(index)"
      >
        <v-icon start size="16">mdi-file-outline</v-icon>
        {{ file.name }}
      </v-chip>
    </div>
  </div>

  <v-row v-if="!props.auto_upload && internal_files.length" class="mt-6">
    <v-col cols="auto">
      <v-btn
        color="primary"
        :loading="loading"
        class="text-none px-8"
        rounded="lg"
        elevation="2"
        @click="upload_files"
      >
        <v-icon start>mdi-upload</v-icon>
        Upload file(s)
      </v-btn>
    </v-col>
  </v-row>
</template>

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

<style scoped>
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

  .gap-2 {
    gap: 8px;
  }

  .text-primary {
    color: rgb(var(--v-theme-primary)) !important;
  }
</style>
