<script setup>
  import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

  import FetchingData from "@ogw_front/components/FetchingData"
  import { useGeodeStore } from "@ogw_front/stores/geode"

  const schema = schemas.opengeodeweb_back.geode_objects_and_output_extensions
  const emit = defineEmits([
    "update_values",
    "increment_step",
    "decrement_step",
  ])

  const { geode_object_type, filenames } = defineProps({
    geode_object_type: { type: String, required: true },
    filenames: { type: Array, required: true },
  })
  const geode_objects_and_output_extensions = ref({})
  const loading = ref(false)

  const toggle_loading = useToggle(loading)

  async function get_output_file_extensions() {
    toggle_loading()
    geode_objects_and_output_extensions.value = {}
    const geodeStore = useGeodeStore()
    const values = await Promise.all(
      filenames.map(async (filename) => {
        const response = await geodeStore.request(schema, {
          geode_object_type,
          filename,
        })
        return response.geode_objects_and_output_extensions
      }),
    )
    const all_keys = [...new Set(values.flatMap((value) => Object.keys(value)))]
    const common_keys = all_keys.filter(
      (i) => !values.some((j) => !Object.keys(j).includes(i)),
    )
    const final_object = {}
    for (const key of common_keys) {
      final_object[key] = {}
      for (const value of values) {
        for (const extension of Object.keys(value[key])) {
          final_object[key][extension] = {
            is_saveable: value[key][extension].is_saveable,
          }
        }
      }
    }
    geode_objects_and_output_extensions.value = final_object
    toggle_loading()
  }

  function update_values(output_geode_object, output_extension) {
    if (output_geode_object !== "" && output_extension !== "") {
      emit("update_values", {
        output_geode_object,
        output_extension,
      })
      emit("increment_step")
    }
  }

  await get_output_file_extensions()
</script>

<template>
  <FetchingData v-if="loading" />
  <v-row v-else class="justify-left">
    <v-col
      v-for="(
        output_extensions, output_geode_object
      ) in geode_objects_and_output_extensions"
      :key="output_geode_object"
      class="justify-left"
    >
      <v-card class="card ma-2 pa-2" width="100%">
        <v-card-title
          v-tooltip:bottom="`Export as a ${output_geode_object}`"
          v-bind="props"
        >
          {{ output_geode_object }}
        </v-card-title>
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
                      @click="
                        update_values(output_geode_object, output_extension)
                      "
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
    </v-col>
  </v-row>
</template>
