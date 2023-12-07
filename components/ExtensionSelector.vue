<template>
  <FetchingData v-if="loading" />
  <v-row
    v-for="(
      output_extensions, geode_object
    ) in geode_objects_and_output_extensions"
    :key="geode_object"
    class="justify-left"
  >
    <v-card class="card ma-2 pa-2" width="100%">
      <v-tooltip :text="`Export as a ${geode_object}`" location="bottom">
        <template v-slot:activator="{ props }">
          <v-card-title v-bind="props">
            {{ geode_object }}
          </v-card-title>
        </template>
      </v-tooltip>
      <v-card-text>
        <v-row>
          <v-col
            v-for="(extension, output_extension) in output_extensions"
            :key="output_extension"
            cols="auto"
            class="pa-0"
          >
            <v-tooltip
              :disabled="extension.is_saveable"
              text="Data not saveable with this file extension"
              location="bottom"
            >
              <template v-slot:activator="{ props }">
                <span v-bind="props">
                  <v-card
                    class="card ma-2"
                    :color="extension.is_saveable ? 'primary' : 'grey'"
                    hover
                    @click="set_variables(geode_object, output_extension)"
                    :disabled="!extension.is_saveable"
                  >
                    <v-card-title align="center">
                      {{ output_extension }}
                    </v-card-title>
                  </v-card>
                </span>
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-row>
</template>

<script setup>
  import schema from "@/assets/schemas/ExtensionSelector.json"

  const emit = defineEmits([
    "update_values",
    "increment_step",
    "decrement_step",
  ])

  const props = defineProps({
    input_geode_object: { type: String, required: true },
    filenames: { type: Array, required: true },
  })
  const { input_geode_object, filenames } = props
  const geode_objects_and_output_extensions = ref({})
  const loading = ref(false)

  const toggle_loading = useToggle(loading)

  async function get_output_file_extensions() {
    toggle_loading()
    geode_objects_and_output_extensions.vaue = {}
    var promise_array = []
    for (const filename of filenames) {
      const params = { input_geode_object, filename }
      const promise = new Promise((resolve, reject) => {
        api_fetch(
          { schema, params },
          {
            request_error_function: () => {
              reject()
            },
            response_function: (response) => {
              geode_objects_and_output_extensions.value =
                response._data.geode_objects_and_output_extensions
              resolve()
            },
            response_error_function: () => {
              reject()
            },
          },
        )
      })
      promise_array.push(promise)
    }
    await Promise.all(promise_array)
    toggle_loading()
  }

  function set_variables(geode_object, output_extension) {
    if (geode_object != "" && output_extension != "") {
      const keys_values_object = {
        output_geode_object: geode_object,
        output_extension,
      }
      emit("update_values", keys_values_object)
      emit("increment_step")
    }
  }

  onMounted(() => {
    get_output_file_extensions()
  })
</script>
