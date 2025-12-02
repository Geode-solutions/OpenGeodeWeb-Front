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

  import FetchingData from "@ogw_front/components/FetchingData.vue"
  import FileUploader from "@ogw_front/components/FileUploader.vue"

  const schema = schemas.opengeodeweb_back.allowed_files
  const emit = defineEmits([
    "update_values",
    "increment_step",
    "decrement_step",
  ])

  const props = defineProps({
    multiple: { type: Boolean, required: true },
    supported_feature: { type: String, required: false, default: null },
    files: { type: Array, required: false, default: [] },
    auto_upload: { type: Boolean, required: false, default: true },
  })

  const { auto_upload, multiple, supported_feature } = props

  const internal_files = ref(props.files)
  const accept = ref("")
  const loading = ref(false)

  watch(
    () => props.files,
    (newVal) => {
      internal_files.value = newVal
    },
    { deep: true },
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
    accept.value = response.data.value.extensions
      .map((extension) => "." + extension)
      .join(",")
    toggle_loading()
  }
  await get_allowed_files()
</script>
