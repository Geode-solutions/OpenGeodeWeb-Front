<template>
  <FetchingData v-if="loading" />
  <v-row v-else class="justify-left">
    <v-col
      v-for="file_extension in file_extensions"
      :key="file_extension"
      cols="auto"
    >
      <v-card
        class="card ma-2"
        hover
        elevation="5"
        @click="set_output_extension(file_extension)"
      >
        <v-card-title align="center">
          {{ file_extension }}
        </v-card-title>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
  const stepper_tree = inject("stepper_tree")
  const { geode_object, route_prefix } = stepper_tree

  const props = defineProps({
    variable_to_update: { type: String, required: true },
    variable_to_increment: { type: String, required: true },
  })
  const { variable_to_update, variable_to_increment } = props

  const loading = ref(false)
  const file_extensions = ref([])

  const toggle_loading = useToggle(loading)

  async function get_output_file_extensions() {
    const params = new FormData()
    params.append("geode_object", geode_object)
    toggle_loading()
    await api_fetch(
      `${route_prefix}/output_file_extensions`,
      { method: "POST", body: params },
      {
        response_function: (response) => {
          file_extensions.value = response._data.output_file_extensions
        },
      },
    )
    toggle_loading()
  }

  function set_output_extension(extension) {
    stepper_tree[variable_to_update] = extension
    stepper_tree[variable_to_increment]++
  }

  onMounted(() => {
    get_output_file_extensions()
  })
</script>

<style scoped>
  .card {
    border-radius: 15px;
  }
</style>
