<template>
  <FetchingData v-if="loading" />
  <v-row v-else-if="Object.keys(allowed_objects).length" class="justify-left">
    <v-col v-for="(value, key) in allowed_objects" :key="key" cols="2" md="2">
      <v-tooltip
        :disabled="value.is_saveable"
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
              :disabled="!value['is_loadable']"
              :elevation="value['is_loadable'] ? 5 : 3"
            >
              <v-img
                :src="geode_objects[key].image"
                cover
                @click="set_geode_object(key)"
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
  import { toRaw } from "vue"
  import geode_objects from "@/assets/geode_objects"
  import schema from "@/assets/schemas/ObjectSelector.json"

  const emit = defineEmits(["update_values", "increment_step"])

  const props = defineProps({
    filenames: { type: Array, required: true },
    key: { type: String, required: false, default: null },
  })

  const { filenames, key } = props

  const loading = ref(false)
  const allowed_objects = ref({})
  const toggle_loading = useToggle(loading)

  async function get_allowed_objects() {
    toggle_loading()
    allowed_objects.value = []
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
              console.log("efijsnegingf")
              console.log(toRaw(allowed_objects.value).length == 0)
              if (toRaw(allowed_objects.value).length == 0) {
                allowed_objects.value = response._data.allowed_objects
              } else {
                allowed_objects.value = toRaw(allowed_objects.value).filter(
                  (value) => response._data.allowed_objects.includes(value),
                )
              }
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

  function set_geode_object(input_geode_object) {
    if (input_geode_object != "") {
      emit("update_values", { input_geode_object })
      emit("increment_step")
    }
  }

  onMounted(() => {
    get_allowed_objects()
  })
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
