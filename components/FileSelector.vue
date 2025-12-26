<template>
  <FetchingData v-if="loading" />
  <FileUploader
    v-else
    v-bind="{ multiple, accept, files, auto_upload }"
    @files_uploaded="files_uploaded_event"
  />
</template>

<script setup>
  import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

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
  const accept = ref("")
  const loading = ref(false)

  const toggle_loading = useToggle(loading)

  function files_uploaded_event(value) {
    if (value.length) {
      emit("update_values", { files: value, auto_upload: false })
      emit("increment_step")
    }
  }

  async function get_allowed_files() {
    toggle_loading()
    const params = {}
    await api_fetch(
      { schema, params },
      {
        response_function: (response) => {
          accept.value = response._data.extensions
            .map((extension) => "." + extension)
            .join(",")
        },
      },
    )
    toggle_loading()
  }
  await get_allowed_files()
</script>
