<template>
  <FetchingData v-if="loading" />
  <FileUploader
    v-bind="{ multiple, accept }"
    @files_value="files_value_event"
  />
</template>

<script setup>
  import { useToggle } from "@vueuse/core"

  const stepper_tree = inject("stepper_tree")
  const { route_prefix } = stepper_tree

  const props = defineProps({
    multiple: { type: Boolean, required: true },
    variable_to_update: { type: String, required: true },
    variable_to_increment: { type: String, required: true },
  })
  const { multiple, variable_to_update, variable_to_increment } = props

  const accept = ref("")
  const loading = ref(false)

  const toggle_loading = useToggle(loading)

  function files_value_event(value) {
    stepper_tree[variable_to_update] = value
    if (value.length) {
      stepper_tree[variable_to_increment]++
    }
  }

  async function get_allowed_files() {
    const route = `${route_prefix}/allowed_files`
    toggle_loading()
    await api_fetch(
      route,
      { method: "GET" },
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

<style scoped>
  .v-btn {
    text-transform: unset !important;
  }
</style>
