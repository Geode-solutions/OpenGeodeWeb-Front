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
  import Status from "@ogw_f/utils/status.js"

  const props = defineProps({
    schema: { type: Object, required: true },
  })

  const geode_store = useGeodeStore()
  const packages_versions = ref([])

  async function get_packages_versions() {
    const array_promise = []

    const promise = new Promise((resolve, reject) => {
      api_fetch(
        { schema: props.schema },
        {
          request_error_function: () => {
            reject()
          },
          response_function: (response) => {
            packages_versions.value = response._data.versions
            resolve()
          },
          response_error_function: () => {
            reject()
          },
        },
      )
    })
    array_promise.push(promise)
    await Promise.all(array_promise)
  }

  watch(
    () => geode_store.status,
    (value) => {
      if (value == Status.CONNECTED) get_packages_versions()
    },
  )

  await get_packages_versions()
</script>
