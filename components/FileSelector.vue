<template>
  <v-file-input
    v-model="files"
    :multiple="multiple"
    :label="label"
    :accept="accept"
    :rules="[(value) => !!value || 'The file is mandatory']"
    color="primary"
    chips
    counter
    show-size
    @click:clear="stepper_tree.files = []"
  />
</template>

<script setup>
const stepper_tree = inject('stepper_tree')
const { route_prefix } = stepper_tree

const props = defineProps({
  multiple: { type: Boolean, required: true },
  label: { type: String, required: true },
  variable_to_update: { type: String, required: true },
  variable_to_increment: { type: String, required: true },
})
const { multiple, label, variable_to_update, variable_to_increment } = props

const accept = ref('')
const files = ref([])

watch(files, (value) => {
  stepper_tree[variable_to_update] = value
  stepper_tree[variable_to_increment]++
})

function fill_extensions(response) {
  const extensions = response._data.extensions
    .map((extension) => '.' + extension)
    .join(',')
  accept.value = extensions
}

async function get_allowed_files() {
  const route = `${route_prefix}/allowed_files`
  await api_fetch(
    route,
    { method: 'GET' },
    {
      response_function: (response) => {
        fill_extensions(response)
      },
    }
  )
}

onMounted(async () => {
  await get_allowed_files()
})
</script>
