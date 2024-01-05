<template>
  <FetchingData v-if="loading" />
  <v-row v-else-if="Object.keys(allowed_objects).length" class="justify-left">
    <v-col v-for="(value, key) in allowed_objects" :key="key" cols="2" md="2">
      <v-tooltip
        :disabled="value.is_loadable"
        :text="
          value['is_loadable']
            ? geode_objects[key].tooltip
            : `Data not loadable with this class (${key})`
        "
        location="bottom"
      >
        <template v-slot:activator="{ props }">
          <span v-bind="props">
            <v-card
              v-ripple
              class="card ma-2"
              hover
              rounded
              @click="set_geode_object(key)"
              :disabled="!value['is_loadable']"
              :elevation="value['is_loadable'] ? 5 : 3"
            >
              <v-img
                :src="geode_objects[key].image"
                cover
                :class="!value['is_loadable'] ? 'disabled' : ''"
              />
            </v-card>
          </span>
        </template>
      </v-tooltip>
    </v-col>
  </v-row>
  <v-row v-else class="pa-5">
    <v-card class="card" variant="tonal" rounded>
      <v-card-text>
        This file format isn't supported! Please check the
        <a
          href="https://docs.geode-solutions.com/guides/formats/"
          target="_blank"
        >
          supported file formats documentation</a
        >
        for more information
      </v-card-text>
    </v-card>
  </v-row>
</template>

<script setup>
  import geode_objects from "@/assets/geode_objects"
  import schema from "@/assets/schemas/ObjectSelector.json"

  const emit = defineEmits(["update_values", "increment_step"])

  const props = defineProps({
    filenames: { type: Array, required: true },
    key: { type: String, required: false, default: null },
  })
  const { filenames, key } = props

  const loading = ref(false)
  const allowed_objects = ref({
    BRep: { is_loadable: true },
    StructuralModel: { is_loadable: true },
  })
  const toggle_loading = useToggle(loading)

  async function get_allowed_objects() {
    toggle_loading()
    allowed_objects.value = {}
    var promise_array = []
    for (const filename of filenames) {
      const params = { filename, key }
      const promise = new Promise((resolve, reject) => {
        api_fetch(
          { schema, params },
          {
            request_error_function: () => {
              reject()
            },
            response_function: (response) => {
              resolve(response._data.allowed_objects)
            },
            response_error_function: () => {
              reject()
            },
          },
        )
      })
      promise_array.push(promise)
    }
    const values = await Promise.all(promise_array)
    const all_keys = [...new Set(values.flatMap((value) => Object.keys(value)))]
    const common_keys = all_keys.filter(
      (i) => !values.some((j) => !Object.keys(j).includes(i)),
    )
    var final_object = {}
    for (const key of common_keys) {
      for (const value of values) {
        if (value[key].is_loadable == false) {
          final_object[key] = { is_loadable: false }
        } else {
          final_object[key] = { is_loadable: true }
        }
      }
    }
    allowed_objects.value = final_object
    toggle_loading()
  }

  function set_geode_object(input_geode_object) {
    if (input_geode_object != "") {
      emit("update_values", { input_geode_object })
      emit("increment_step")
    }
  }

  await get_allowed_objects()
  console.log("allowed_objects", allowed_objects.value)
</script>

<style scoped>
  .disabled {
    filter: opacity(0.7);
    cursor: pointer;
  }
  .disabled div {
    cursor: not-allowed;
  }
</style>
