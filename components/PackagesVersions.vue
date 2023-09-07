<template>
  <v-container>
    This tool uses our Open-Source codes
    <v-tooltip location="end">
      <span v-for="package_version in packages_versions" :key="package_version.package">
        {{ package_version.package }} v{{ package_version.version }}
        <br>
      </span>
      <template #activator="{ props }">
        <v-icon v-bind="props" color="primary" class="justify-right">
          mdi-information-outline
        </v-icon>
      </template>
    </v-tooltip>
  </v-container>
</template>

<script setup>
const props = defineProps({
  route_prefix: { type: String, required: true }
})
const { route_prefix } = props

const cloud_store = use_cloud_store()
const { is_cloud_running } = storeToRefs(cloud_store)

const packages_versions = ref([])

async function get_packages_versions () {
  await api_fetch(`${route_prefix}/versions`, { method: 'GET' }, {
    'response_function': (response) => {
      packages_versions.value = response._data.versions
    }
  })
}

watch(is_cloud_running, (value) => {
  if (value === true) {
    get_packages_versions()
  }
})

onMounted(() => {
  if (is_cloud_running.value === true) {
    get_packages_versions()
  }
})

onActivated(() => {
  if (is_cloud_running.value === true) {
    get_packages_versions()
  }
})
</script>
