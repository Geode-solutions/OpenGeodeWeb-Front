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

  const emit = defineEmits(["files_value"])

  const stepper_tree = inject("stepper_tree")
  const { route_prefix } = stepper_tree

  const props = defineProps({
    multiple: { type: Boolean, required: true },
    accept: { type: String, required: true },
  })
  const { multiple, accept } = props

  const label = multiple ? "Please select file(s)" : "Please select a file"
  const files = ref([])
  const loading = ref(false)
  const files_uploaded = ref(false)

  const toggle_loading = useToggle(loading)

  async function upload_files() {
    toggle_loading()
    for (const file of files.value) {
      const reader = new FileReader()
      reader.onload = async function (event) {
        const params = new FormData()
        params.append("file", event.target.result)
        params.append("filename", file.name)
        params.append("filesize", file.size)

        await api_fetch(`${route_prefix}/upload_file`, {
          method: "POST",
          body: params,
        })
      }
      reader.readAsDataURL(file)
    }
    toggle_loading()
    files_uploaded.value = true
    emit("files_value", files.value)
  }

  function clear() {
    files.value = []
    emit("files_value", files.value)
  }

  watch(files, () => {
    files_uploaded.value = false
  })
</script>

<style scoped>
  .v-btn {
    text-transform: unset !important;
  }
</style>
