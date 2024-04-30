<template>
  <div class="pa-0">
    <v-btn
      :loading="loading"
      color="primary"
      @click="get_inspection_results(props.input_geode_object, props.filename)"
    >
      Inspect
      <template #loader>
        <v-progress-circular indeterminate size="20" color="white" width="3" />
      </template>
    </v-btn>
    <v-btn variant="text" @click="emit('decrement_step')">Cancel</v-btn>
  </div>
</template>

<script setup>
  import schemas from "@geode/opengeodeweb-back/schemas.json"
  const schema = schemas.opengeodeweb_back.inspect_file

  const emit = defineEmits([
    "update_values",
    "increment_step",
    "decrement_step",
  ])
  const props = defineProps({
    input_geode_object: { type: String, required: true },
    filename: { type: String, required: true },
  })
  const loading = ref(false)
  const toggle_loading = useToggle(loading)

  async function get_inspection_results(input_geode_object, filename) {
    toggle_loading()
    const params = { input_geode_object, filename }

    await api_fetch(
      { schema, params },
      {
        response_function: (response) => {
          emit("update_values", {
            inspection_result: [response._data.inspection_result],
          })
          emit("increment_step")
        },
      },
    )
    toggle_loading()
  }
</script>
