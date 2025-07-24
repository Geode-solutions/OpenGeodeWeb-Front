<template>
  <v-row>
    <v-col class="pa-0">
      <v-file-input
        v-model="internal_files"
        :multiple="props.multiple"
        :label="label"
        :accept="props.accept"
        :rules="[(value) => !!value || 'The file is mandatory']"
        color="primary"
        :hide-input="props.mini"
        :hide-details="props.mini"
        chips
        counter
        show-size
        @click:clear="clear()"
      />
    </v-col>
  </v-row>
  <v-row v-if="!props.auto_upload">
    <v-col cols="auto">
      <v-btn
        color="primary"
        :disabled="!internal_files.length && !files_uploaded"
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
  import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  const schema = schemas.opengeodeweb_back.upload_file

  const emit = defineEmits(["files_uploaded", "decrement_step"])

  const props = defineProps({
    multiple: { type: Boolean, required: true },
    accept: { type: String, required: true },
    files: { type: Array, required: false, default: [] },
    auto_upload: { type: Boolean, required: false, default: false },
    mini: { type: Boolean, required: false, default: false },
  })

  const label = props.multiple
    ? "Please select file(s) to import"
    : "Please select a file to import"
  const internal_files = ref([])
  const loading = ref(false)
  const files_uploaded = ref(false)

  const toggle_loading = useToggle(loading)

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

  function clear() {
    internal_files.value = []
    emit("files_uploaded", internal_files.value)
  }

  watch(internal_files, (value) => {
    files_uploaded.value = false
    if (props.auto_upload) {
      if (props.multiple.value == false) {
        internal_files.value = [value]
      }
      upload_files()
    }
  })
</script>

<style scoped>
  .div.v-input__details {
    display: none;
  }
</style>
