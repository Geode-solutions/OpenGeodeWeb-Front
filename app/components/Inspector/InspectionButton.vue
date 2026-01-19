<template>
  <div class="pa-0">
    <v-btn
      :loading="loading"
      color="primary"
      @click="get_inspection_results(props.geode_object_type, props.filename)"
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
  import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"
  const schema = schemas.opengeodeweb_back.inspect_file

  const emit = defineEmits([
    "update_values",
    "increment_step",
    "decrement_step",
  ])
  const props = defineProps({
    geode_object_type: { type: String, required: true },
    filename: { type: String, required: true },
  })
  const loading = ref(false)
  const toggle_loading = useToggle(loading)

  async function get_inspection_results(geode_object_type, filename) {
    toggle_loading()
    const params = { geode_object_type, filename }
    const geodeStore = useGeodeStore()

    await geodeStore.request(schema, params, {
      response_function: (response) => {
        emit("update_values", {
          inspection_result: [response.inspection_result],
        })
        emit("increment_step")
      },
    })
    toggle_loading()
  }
</script>
