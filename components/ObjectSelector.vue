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
  import geode_objects from "@ogw_f/assets/geode_objects"
  import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

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
    const responses = await Promise.all(
      filenames.map((filename) =>
        api_fetch({ schema, params: { filename, supported_feature } }),
      ),
    )
    const values = responses.map((r) => r.data.value.allowed_objects)
    const allKeys = [...new Set(values.flatMap((v) => Object.keys(v)))]
    const commonKeys = allKeys.filter(
      (key) =>
        !values.some((obj) => !Object.prototype.hasOwnProperty.call(obj, key)),
    )
    const finalObject = {}
    for (const key of commonKeys) {
      const loadScores = values.map((obj) => obj[key].is_loadable)
      const priorities = values
        .map((obj) => obj[key].object_priority)
        .filter((p) => p !== undefined && p !== null)
      finalObject[key] = { is_loadable: Math.min(...loadScores) }
      if (priorities.length) {
        finalObject[key].object_priority = Math.max(...priorities)
      }
    }
    allowed_objects.value = finalObject
    let alreadySelected = false
    const objectKeys = Object.keys(finalObject)
    if (objectKeys.length) {
      const highestLoadScore = Math.max(
        ...objectKeys.map((key) => finalObject[key].is_loadable),
      )
      if (highestLoadScore > 0) {
        const bestScoreObjects = objectKeys.filter(
          (key) => finalObject[key].is_loadable === highestLoadScore,
        )
        if (bestScoreObjects.length === 1) {
          set_geode_object(bestScoreObjects[0])
          alreadySelected = true
        } else {
          const highestPriority = Math.max(
            ...bestScoreObjects.map(
              (key) => finalObject[key].object_priority ?? -Infinity,
            ),
          )
          const bestPriorityObjects = bestScoreObjects.filter(
            (key) => finalObject[key].object_priority === highestPriority,
          )
          if (
            highestPriority !== -Infinity &&
            bestPriorityObjects.length === 1
          ) {
            set_geode_object(bestPriorityObjects[0])
            alreadySelected = true
          }
        }
      }
    }
    if (!alreadySelected && objectKeys.length === 1) {
      set_geode_object(objectKeys[0])
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
