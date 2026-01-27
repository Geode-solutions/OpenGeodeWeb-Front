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
                :class="!value['is_loadable'] ? 'disabled' : undefined"
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
  import FetchingData from "@ogw_front/components/FetchingData.vue"
  import { geode_objects } from "@ogw_front/assets/geode_objects"
  import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import { useGeodeStore } from "@ogw_front/stores/geode"

  const schema = schemas.opengeodeweb_back.allowed_objects

  const emit = defineEmits(["update_values", "increment_step"])
  console.log("ObjectSelector")
  const props = defineProps({
    filenames: { type: Array, required: true },
  })

  const geodeStore = useGeodeStore()
  const { filenames } = props

  const loading = ref(false)
  const allowed_objects = ref({})
  const toggle_loading = useToggle(loading)

  function select_geode_object(object_map) {
    const object_keys = Object.keys(object_map)
    if (!object_keys.length) {
      return undefined
    }
    if (
      object_keys.length === 1 &&
      object_map[object_keys[0]].is_loadable > 0
    ) {
      return object_keys[0]
    }
    const highest_load_score = Math.max(
      ...object_keys.map((key) => object_map[key].is_loadable),
    )
    if (highest_load_score <= 0) {
      return undefined
    }
    const best_score_objects = object_keys.filter(
      (key) => object_map[key].is_loadable === highest_load_score,
    )
    if (best_score_objects.length === 1) {
      return best_score_objects[0]
    }
    const highest_priority = Math.max(
      ...best_score_objects.map(
        (key) => object_map[key].object_priority ?? -Infinity,
      ),
    )
    const best_priority_objects = best_score_objects.filter(
      (key) => object_map[key].object_priority === highest_priority,
    )
    if (highest_priority !== -Infinity && best_priority_objects.length === 1) {
      return best_priority_objects[0]
    }
    return undefined
  }

  async function get_allowed_objects() {
    toggle_loading()
    allowed_objects.value = {}

    const promise_array = filenames.map((filename) => {
      return geodeStore.request(schema, { filename })
    })
    const responses = await Promise.all(promise_array)
    const allowed_objects_list = responses.map((r) => r.allowed_objects)
    const all_keys = [...new Set(allowed_objects_list.flatMap(Object.keys))]
    const common_keys = all_keys.filter((key) =>
      allowed_objects_list.every((obj) => key in obj),
    )
    const final_object = {}
    for (const key of common_keys) {
      const load_scores = allowed_objects_list.map(
        (obj) => obj[key].is_loadable,
      )
      const priorities = allowed_objects_list
        .map((obj) => obj[key].object_priority)
        .filter((p) => p !== undefined && p !== null)
      final_object[key] = { is_loadable: Math.min(...load_scores) }
      if (priorities.length) {
        final_object[key].object_priority = Math.max(...priorities)
      }
    }
    allowed_objects.value = final_object
    const selected_object = select_geode_object(final_object)
    if (selected_object) {
      set_geode_object(selected_object)
    }
    toggle_loading()
  }

  function set_geode_object(geode_object_type) {
    console.log("set_geode_object", { geode_object_type })
    if (geode_object_type) {
      emit("update_values", { geode_object_type })
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
