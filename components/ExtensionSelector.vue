<template>
  <v-row class="justify-left">
    <v-col v-for="file_extension in file_extensions" :key="file_extension" cols="2">
      <v-card class="card ma-2" hover elevation="5" @click="set_output_extension(file_extension)">
        <v-card-title align="center">
          {{ file_extension }}
        </v-card-title>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import geode_objects from '@assets/geode_objects';

const props = defineProps({
  geode_object: { type: String, required: true, validator (value) { return geode_objects.keys().includes(value) } },
  route_prefix: { type: String, required: true },
  variable_to_update: { type: String, required: true },
  variable_to_increment: { type: String, required: true },
})

const { geode_object, route_prefix, variable_to_update, variable_to_increment } = props

const file_extensions = ref([])


async function get_output_file_extensions () {

  const params = new FormData()
  params.append('geode_object', geode_object)

  await api_fetch(`${route_prefix}/output_file_extensions`, { method: 'POST', body: params },
    {
      'response_function': (response) => {
        file_extensions.value = response._data.output_file_extensions
      },
    }
  )
}

function set_output_extension (extension) {
  const stepper_tree = inject('stepper_tree')
  stepper_tree[variable_to_update] = extension
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