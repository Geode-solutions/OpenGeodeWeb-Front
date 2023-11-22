<template>
  <FetchingData v-if="loading" />
  <FileUploader
    v-else
    v-bind="{ multiple, accept, route }"
    @files_uploaded="files_uploaded_event"
  />
</template>

<script setup>
  import FetchingData from "@/components/FetchingData.vue"
  import FileUploader from "@/components/FileUploader.vue"
  const emit = defineEmits([
    "update_values",
    "increment_step",
    "decrement_step",
  ])

  const props = defineProps({
    multiple: { type: Boolean, required: true },
    key: { type: String, required: false, default: "" },
    route: { type: String, required: false, default: "" },
    schema: { type: Object, required: true },
  })

  const { multiple, key, route, schema } = props

  const accept = ref("")
  const loading = ref(false)

  const toggle_loading = useToggle(loading)

  function files_uploaded_event(value) {
    if (value.length) {
      emit("update_values", { files: value })
      emit("increment_step")
    }
  }

  async function get_allowed_files() {
    toggle_loading()
    const params = { key }
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
  onMounted(() => {
    get_allowed_files()
  })
</script>
