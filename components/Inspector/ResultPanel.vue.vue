<template>
  <v-container class="pa-2">
    <v-expansion-panels v-model="opened_panels" multiple elevation="5">
      <v-expansion-panel
        v-for="(result, index) in inspection_results"
        :key="index"
        class="card"
      >
        <v-expansion-panel-title>
          <v-row align="center">
            <v-col cols="auto">
              <v-icon v-if="result.nb_issues == 0" color="primary" size="25">
                mdi-check-circle-outline
              </v-icon>
              <v-icon v-else color="error" size="25"> mdi-close-circle </v-icon>
            </v-col>
            <v-col>
              {{ result.title }}
            </v-col>
          </v-row>
        </v-expansion-panel-title>
        <v-expansion-panel-text
          :disabled="result.nb_issues == 0 || result.children"
        >
          <InspectorResultPanel
            v-if="result.children"
            v-bind="{
              inspection_results: result.children,
              fetch_results: false,
            }"
          />
          <v-container v-if="result.nb_issues > 0">
            <v-col>
              <v-row
                v-for="(issue, index) in result.issues"
                :key="index"
                class="pa-0"
              >
                {{ issue }}
              </v-row>
            </v-col>
          </v-container>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script setup>
  import InspectorResultPanel from "./ResultPanel.vue"
  import schemas from "@geode/opengeodeweb-back/schemas.json"
  const schema = schemas.opengeodeweb_back.inspect_file

  const emit = defineEmits([
    "update_values",
    "increment_step",
    "decrement_step",
  ])

  const props = defineProps({
    inspection_results: { type: Array, required: false },
    input_geode_object: { type: String, required: false },
    filename: { type: String, required: false },
    fetch_results: { type: Boolean, required: false, default: true },
  })
  const { inspection_results, input_geode_object, filename, fetch_results } =
    props
  const opened_panels = ref([])

  onMounted(() => {
    if (fetch_results) {
      fetch_inspection_results()
    }
    opened_panels.value = Array.from(Array(inspection_results.length).keys())
  })

  async function fetch_inspection_results(input_geode_object, filename) {
    const params = {
      input_geode_object,
      filename,
    }
    await api_fetch(
      { schema, params },
      {
        response_error_function: () => {},
        response_function: (response) => {
          inspection_results.value = response._data.inspection_results
        },
        response_error_function: () => {},
      },
    )
  }
</script>
