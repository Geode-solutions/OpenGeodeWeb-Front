<template>
  <v-container class="pa-2">
    <v-expansion-panels v-model="opened_panels" multiple elevation="5">
      <v-expansion-panel
        v-for="(result, index) in props.inspection_results"
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
        <v-expansion-panel-text>
          <InspectorResultPanel
            v-if="result.children"
            v-bind="{
              inspection_results: result.children,
              index_to_update: props.index_array.concat(index),
            }"
            @update_inspection_results="update_inspection_results()"
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
  import schemas from "@geode/opengeodeweb-back/schemas.json"
  const schema = schemas.opengeodeweb_back.inspect_file

  const emit = defineEmits([
    "update_values",
    "increment_step",
    "decrement_step",
    "update_inspection_results",
  ])

  const stepper_tree = inject("stepper_tree")

  const props = defineProps({
    inspection_results: { type: Array, required: true },
    // input_geode_object: { type: String, required: false },
    // filename: { type: String, required: false },
    // fetch_results: { type: Boolean, required: false, default: true },
  })

  const opened_panels = ref([])

  onMounted(async () => {
    if (props.fetch_results) {
      await fetch_inspection_results(props.input_geode_object, props.filename)
    }
    console.log("inspection_results", props.inspection_results)
    for (let i = 0; i < props.inspection_results.length; i++) {
      if (props.inspection_results[i].nb_issues > 0) {
        emit("update_inspection_results", { index_to_update })
      }
    }
    opened_panels.value = Array.from(Array(inspection_results.length).keys())
  })

  // async function fetch_inspection_results(input_geode_object, filename) {
  //   const params = {
  //     input_geode_object,
  //     filename,
  //   }
  //   await api_fetch(
  //     { schema, params },
  //     {
  //       response_error_function: () => {},
  //       response_function: (response) => {
  //         emit("update_values", {
  //           inspection_results: response._data.inspection_results,
  //         })
  //       },
  //       response_error_function: () => {},
  //     },
  //   )
  // }
</script>
