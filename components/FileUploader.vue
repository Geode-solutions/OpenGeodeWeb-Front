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
        @click="upload_files()"
        color="primary"
        :disabled="!files.length && !files_uploaded"
        :loading="loading"
        class="pa-2"
      >
        Upload file(s)</v-btn
      >
    </v-col>
  </v-row>
</template>

<script setup>
  const emit = defineEmits(["files_uploaded", "decrement_step"])

  const props = defineProps({
    multiple: { type: Boolean, required: true },
    accept: { type: String, required: true },
    route: { type: String, required: true },
  })
  const { multiple, accept, route } = toRefs(props)

  const label = multiple ? "Please select file(s)" : "Please select a file"
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
          { route, file },
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

  function clear() {
    files.value = []
    emit("files_uploaded", files.value)
  }

  watch(files, () => {
    files_uploaded.value = false
  })
</script>
