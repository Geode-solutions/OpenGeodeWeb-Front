<template>
  <v-row>
    <v-col class="pa-0">
      <v-file-input
        v-model="files"
        :multiple="multiple"
        :label="label"
        :accept="accept"
        :rules="[(value) => !!value || 'The file is mandatory']"
        color="primary"
        chips
        counter
        show-size
        @click:clear="clear()"
      />
    </v-col>
  </v-row>
  <v-row>
    <v-col cols="auto">
      <v-btn
        color="primary"
        :disabled="!files.length && !files_uploaded"
        :loading="loading"
        class="pa-2"
        @click="upload_files"
      >
        Upload file(s)
      </v-btn>
    </v-col>
  </v-row>
</template>

<script setup>
  import schemas from "@geode/opengeodeweb-back/schemas.json"
  const schema = schemas.opengeodeweb_back.upload_file

  const emit = defineEmits(["files_uploaded", "decrement_step"])

  const props = defineProps({
    multiple: { type: Boolean, required: true },
    accept: { type: String, required: true },
    files: { type: Array, required: false, default: [] },
    auto_upload: { type: Boolean, required: true },
  })

  const { multiple, accept } = toRefs(props)

  const label = multiple
    ? "Please select file(s) to import"
    : "Please select a file to import"
  const files = ref([])
  const loading = ref(false)
  const files_uploaded = ref(false)

  const toggle_loading = useToggle(loading)

  async function upload_files() {
    toggle_loading()
    var promise_array = []
    for (const file of files.value) {
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
    emit("files_uploaded", files.value)
    toggle_loading()
  }

  if (props.files.length && props.auto_upload) {
    files.value = props.files
    upload_files()
  }

  function clear() {
    files.value = []
    emit("files_uploaded", files.value)
  }

  watch(files, () => {
    files_uploaded.value = false
  })
</script>
