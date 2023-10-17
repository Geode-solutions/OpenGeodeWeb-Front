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
        @click="upload_files(files)"
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
  import { useToggle } from "@vueuse/core"

  const stepper_tree = inject("stepper_tree")
  const { route_prefix } = stepper_tree

  const props = defineProps({
    multiple: { type: Boolean, required: true },
    variable_to_update: { type: String, required: false },
    variable_to_increment: { type: String, required: false },
  })
  const { multiple, variable_to_update, variable_to_increment } = props

  const label = multiple ? "Please select file(s)" : "Please select a file"
  const accept = ref("")
  const files = ref([])
  const loading = ref(false)
  const files_uploaded = ref(false)

  const toggle_loading = useToggle(loading)

  function clear() {
    files.value = []
    stepper_tree[variable_to_update] = []
  }

  function fill_extensions(response) {
    const extensions = response._data.extensions
      .map((extension) => "." + extension)
      .join(",")
    accept.value = extensions
  }

  async function get_allowed_files() {
    const route = `${route_prefix}/allowed_files`
    await api_fetch(
      route,
      { method: "GET" },
      {
        response_function: (response) => {
          fill_extensions(response)
        },
      },
    )
  }

  async function upload_files(response_function = {}) {
    return new Promise((resolve, reject) => {
      toggle_loading()
      for (const file of files.value) {
        const reader = new FileReader()
        reader.onload = async function (event) {
          const params = new FormData()
          params.append("file", event.target.result)
          params.append("filename", file.name)
          params.append("filesize", file.size)

          await api_fetch(
            `${route_prefix}/upload_file`,
            { method: "POST", body: params },
            {
              request_error_function: () => {
                reject()
              },
              response_function: () => {
                if (response_function) {
                  response_function(response)
                }
                resolve()
              },
              response_error_function: () => {
                reject()
              },
            },
          )
        }
        reader.readAsDataURL(file)
      }
      toggle_loading()
      files_uploaded.value = true
    })
  }

  watch(files_uploaded, (value) => {
    if (value) {
      stepper_tree[variable_to_update] = files.value
      stepper_tree[variable_to_increment]++
    }
  })

  onMounted(async () => {
    if (mandatory_files.length !== 0 || additional_files.length !== 0) {
      accept.value = "*"
    } else {
      get_allowed_files()
    }
  })
</script>

<style scoped>
  .v-btn {
    text-transform: unset !important;
  }
</style>
