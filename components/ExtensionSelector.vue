<template>
  <FetchingData v-if="loading" />
  <v-row
    v-for="item in geode_objects_and_output_extensions"
    :key="item.geode_object"
    class="justify - left"
  >
    <v-card class="card ma-2 pa-2" elevation="5" width="100%">
      <v-tooltip :text="`Export as a ${item.geode_object}`" location="bottom">
        <template v-slot:activator="{ props }">
          <v-card-title v-bind="props">
            {{ item.geode_object }}
          </v-card-title>
        </template>
      </v-tooltip>
      <v-card-text>
        <v-row>
          <v-col
            v-for="output_extension in item.output_extensions"
            :key="output_extension"
            cols="auto"
            class="pa-0"
          >
            <v-card
              class="card ma-2"
              color="primary"
              hover
              elevation="5"
              @click="set_variables(item.geode_object, output_extension)"
            >
              <v-card-title align="center">
                {{ output_extension }}
              </v-card-title>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-row>
</template>

<script setup>
  const stepper_tree = inject("stepper_tree")
  const { input_geode_object, route_prefix } = stepper_tree

  const props = defineProps({
    variable_to_update: { type: String, required: true },
    variable_to_increment: { type: String, required: true },
  })
  const { variable_to_update, variable_to_increment } = props

  const geode_objects_and_output_extensions = ref([])
  const loading = ref(false)

  const toggle_loading = useToggle(loading)

  async function get_output_file_extensions() {
    const params = new FormData()
    params.append("input_geode_object", input_geode_object)
    toggle_loading()
    await api_fetch(
      `${route_prefix}/output_file_extensions`,
      { method: "POST", body: params },
      {
        response_function: (response) => {
          geode_objects_and_output_extensions.value =
            response._data.geode_objects_and_output_extensions
        },
      },
    )
    toggle_loading()
  }

  function set_variables(geode_object, output_extension) {
    stepper_tree[variable_to_update]["output_geode_object"] = geode_object
    stepper_tree[variable_to_update]["output_extension"] = output_extension
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
