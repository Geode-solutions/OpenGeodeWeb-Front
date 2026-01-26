<template>
  <FetchingData v-if="loading" />
  <FileUploader
    v-else
    v-bind="{ multiple, accept, files: internal_files, auto_upload }"
    @files_uploaded="files_uploaded_event"
  />
</template>

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

  const props = defineProps({
    multiple: { type: Boolean, required: true },
    files: { type: Array, default: () => [] },
    auto_upload: { type: Boolean, default: true },
  })

  const internal_files = ref(props.files)
  const auto_upload = ref(props.auto_upload)
  const accept = ref("")
  const loading = ref(false)

  watch(
    () => props.files,
    (val) => (internal_files.value = val),
  )

  watch(
    () => props.auto_upload,
    (val) => (auto_upload.value = val),
  )

  const toggle_loading = useToggle(loading)

  function files_uploaded_event(value) {
    if (value.length) {
      emit("update_values", { files: value, auto_upload: false })
      emit("increment_step")
    }
  }

  async function get_allowed_files() {
    toggle_loading()
    const geodeStore = useGeodeStore()
    const response = await geodeStore.request(schema, {})
    accept.value = response.extensions.map((e) => `.${e}`).join(",")
    toggle_loading()
  }

  await get_allowed_files()
</script>
