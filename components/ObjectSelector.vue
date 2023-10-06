<template>
  <v-row v-if="allowed_objects.length" class="justify-left">
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
        <a href="https://docs.geode-solutions.com/formats/" target="_blank">
          supported file formats documentation</a
        >
        for more information
      </v-card-text>
    </v-card>
  </v-row>
</template>

<script setup>
import geode_objects from '@/assets/geode_objects'

const stepper_tree = inject('stepper_tree')
const { files, route_prefix } = stepper_tree

const props = defineProps({
  variable_to_update: { type: String, required: true },
  variable_to_increment: { type: String, required: true },
})

const { variable_to_update, variable_to_increment } = props

const allowed_objects = ref([])

async function get_allowed_objects() {
  const params = new FormData()
  params.append('filename', files[0].name)

  await api_fetch(
    `${route_prefix}/allowed_objects`,
    { method: 'POST', body: params },
    {
      response_function: (response) => {
        allowed_objects.value = response._data.allowed_objects
      },
    }
  )
}

function set_geode_object(geode_object) {
  stepper_tree[variable_to_update] = geode_object
  stepper_tree[variable_to_increment]++
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
