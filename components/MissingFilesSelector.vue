<template>
  <FetchingData v-if="loading" />
  <v-container v-else-if="has_missing_files">
    <v-row v-if="mandatory_files.length" align="center">
      <v-col cols="auto" class="pa-0">
        <v-icon color="warning" icon="mdi-file-document-alert-outline" />
      </v-col>
      <p class="pa-1">Mandatory files:</p>
      <v-col v-for="mandatory_file in mandatory_files" class="pa-0">
        <v-chip>{{ mandatory_file }}</v-chip>
      </v-col>
    </v-row>
    <v-row v-if="additional_files.length" align="center">
      <v-col cols="auto" class="pa-0">
        <v-icon color="accent" icon="mdi-file-document-plus-outline" />
      </v-col>
      <p class="pa-1">Additional files :</p>
      <v-col
        v-for="additional_file in additional_files"
        cols="auto"
        class="pa-0"
      >
        <v-chip>{{ additional_file }}</v-chip>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <FileSelector
          :multiple="multiple"
          :variable_to_update="variable_to_update"
          :variable_to_increment="variable_to_increment"
          :mandatory_files="mandatory_files"
          :additional_files="additional_files"
          ref="file_selector"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        v-if="!mandatory_files.length && additional_files.length"
        cols="auto"
      >
        <v-btn @click="skip_step()" color="warning"> Skip step </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { useToggle } from "@vueuse/core"

  const stepper_tree = inject("stepper_tree")
  const { route_prefix } = stepper_tree

  const props = defineProps({
    multiple: { type: Boolean, required: true },
    geode_object: { type: String, required: true },
    files: { type: Array, required: true },
    variable_to_update: { type: String, required: false },
    variable_to_increment: { type: String, required: false },
    response_function: { type: Function, required: false },
  })

  const {
    multiple,
    geode_object,
    files,
    variable_to_update,
    variable_to_increment,
  } = props

  const file_selector = ref(null)
  const loading = ref(true)
  const has_missing_files = ref(false)
  const mandatory_files = ref([])
  const additional_files = ref([])

  const toggle_loading = useToggle(loading)

  function skip_step() {
    stepper_tree[variable_to_increment] += 1
  }

  async function missing_files() {
    has_missing_files.value = false
    mandatory_files.value = []
    additional_files.value = []
    toggle_loading()
    for (const file of files) {
      const reader = new FileReader()
      reader.onload = async function (event) {
        const params = new FormData()
        params.append("geode_object", geode_object)
        params.append("filename", file.name)
        loading.value = true
        await api_fetch(
          `${route_prefix}/missing_files`,
          { method: "POST", body: params },
          {
            response_function: (response) => {
              has_missing_files.value = response._data.has_missing_files
              mandatory_files.value.push(response._data.mandatory_files)
              additional_files.value.push(response._data.additional_files)
            },
          },
        )
      }
      reader.readAsDataURL(file)
    }
    toggle_loading()
    if (!has_missing_files.value) {
      skip_step()
    }
  }

  onMounted(async () => {
    missing_files()
  })
</script>

<style scoped>
  .v-btn {
    text-transform: unset !important;
  }
</style>
