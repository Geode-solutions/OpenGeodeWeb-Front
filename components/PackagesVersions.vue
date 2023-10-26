<template>
  <v-container>
    This tool uses our Open-Source codes
    <v-tooltip location="end">
      <span
        v-for="package_version in packages_versions"
        :key="package_version.package"
      >
        {{ package_version.package }} v{{ package_version.version }}
        <br />
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
  const cloud_store = use_cloud_store()
  const { is_running } = storeToRefs(cloud_store)

  const props = defineProps({
    schema: { type: Object, required: true },
  })
  const { schema } = props

  const packages_versions = ref([])

  function get_packages_versions() {
    api_fetch(
      { schema },
      {
        response_function: (response) => {
          console.log("response", response)
          packages_versions.value = response._data.versions
        },
      },
    )
  }

  watch(is_running, (value) => {
    console.log("watch", value)
    if (value === true) {
      get_packages_versions()
    }
  })

  onMounted(() => {
    console.log("mounted", is_running)
    if (is_running.value) {
      console.log("mounted ??")
      get_packages_versions()
    }
  })

  onActivated(() => {
    console.log("onActivated", is_running)
    if (is_running.value === true) {
      get_packages_versions()
    }
  })
</script>
