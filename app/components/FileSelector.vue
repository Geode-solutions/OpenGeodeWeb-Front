<script setup>
  import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

  import FetchingData from "@ogw_front/components/FetchingData"
  import FileUploader from "@ogw_front/components/FileUploader"
  import { useGeodeStore } from "@ogw_front/stores/geode"

  const schema = schemas.opengeodeweb_back.allowed_files

  const emit = defineEmits([
    "update_values",
    "increment_step",
    "decrement_step",
  ])

  const { multiple, files, auto_upload } = defineProps({
    multiple: { type: Boolean, required: true },
    files: { type: Array, default: () => [] },
    auto_upload: { type: Boolean, default: true },
  })

  const internal_files = ref(files)
  const internal_auto_upload = ref(auto_upload)
  const accept = ref("")
  const loading = ref(false)

  watch(
    () => files,
    (val) => {
      internal_files.value = val
    },
  )

  watch(
    () => auto_upload,
    (val) => {
      internal_auto_upload.value = val
    },
  )

  const toggle_loading = useToggle(loading)

  function files_uploaded_event(value) {
    if (value.length > 0) {
      emit("update_values", { files: value, auto_upload: false })
      emit("increment_step")
    }
  }

  async function get_allowed_files() {
    toggle_loading()
    const geodeStore = useGeodeStore()
    const response = await geodeStore.request(schema, {})
    accept.value = response.extensions.map((extension) => `.${extension}`).join(",")
    toggle_loading()
  }

  await get_allowed_files()
</script>

<template>
  <FetchingData v-if="loading" />
  <FileUploader
    v-else
    v-bind="{ multiple, accept, files: internal_files, auto_upload: internal_auto_upload }"
    @files_uploaded="files_uploaded_event"
  />
</template>
