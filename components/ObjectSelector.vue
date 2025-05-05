<template>
  <FetchingData v-if="loading" />
  <v-row v-else-if="Object.keys(allowed_objects).length" class="justify-left">
    <v-col v-for="(value, key) in allowed_objects" :key="key" cols="3" md="4">
      <v-tooltip
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
  import schemas from "@geode/opengeodeweb-back/schemas.json"

  const schema = schemas.opengeodeweb_back.allowed_objects

  const emit = defineEmits(["update_values", "increment_step"])

  const props = defineProps({
    filenames: { type: Array, required: true },
    supported_feature: { type: String, required: false, default: null },
  })
  const { filenames, supported_feature } = props

  const loading = ref(false)
  const allowed_objects = ref({})
  const toggle_loading = useToggle(loading)

  async function get_allowed_objects() {
    toggle_loading()
    allowed_objects.value = {}
    var promise_array = []
    for (const filename of filenames) {
      const params = { filename, supported_feature }
      const promise = api_fetch({ schema, params })
      promise_array.push(promise)
    }
    const responses = await Promise.all(promise_array)
    let values = []
    for (const response of responses) {
      values.push(response.data.value.allowed_objects)
    }
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
    if (Object.keys(allowed_objects.value).length == 1) {
      set_geode_object(Object.keys(allowed_objects.value)[0])
    }
    toggle_loading()
  }

  function set_geode_object(input_geode_object) {
    if (input_geode_object != "") {
      emit("update_values", { input_geode_object })
      emit("increment_step")
    }
  }
  await get_allowed_objects()
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
