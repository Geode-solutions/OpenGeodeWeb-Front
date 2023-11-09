<template>
  <FetchingData v-if="loading" />
  <v-row v-else-if="allowed_objects.length" class="justify-left">
    <v-col v-for="object in allowed_objects" :key="object" cols="2" md="2">
      <v-card v-ripple class="card ma-2" hover elevation="5" rounded>
        <v-img
          :src="geode_objects[object].image"
          cover
          @click="set_geode_object(object)"
        />
        <v-tooltip activator="parent" location="bottom">
          {{ geode_objects[object].tooltip }}
        </v-tooltip>
      </v-card>
    </v-col>
  </v-row>
  <v-row v-else class="pa-5">
    <v-card class="card" variant="tonal" elevation="5" rounded>
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

  const stepper_tree = inject("stepper_tree")

  const props = defineProps({
    files: { type: Array, required: true },
    schema: { type: Object, required: true },
  })

  const { files, schema } = props

  const loading = ref(false)
  const allowed_objects = ref([])

  const toggle_loading = useToggle(loading)

  async function get_allowed_objects() {
    const params = { filename: files[0].name }
    toggle_loading()
    await api_fetch(
      { schema, params },
      {
        response_function: (response) => {
          allowed_objects.value = response._data.allowed_objects
        },
      },
    )
    toggle_loading()
  }

  function set_geode_object(geode_object) {
    stepper_tree["input_geode_object"] = geode_object
    stepper_tree["current_step_index"]++
  }

  onMounted(() => {
    get_allowed_objects()
  })
</script>

<style scoped>
  .card {
    border-radius: 15px;
  }
</style>
