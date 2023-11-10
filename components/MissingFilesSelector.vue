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
      <p class="pa-1">Additional files:</p>
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
        <FileUploader
          v-bind="{ multiple, accept }"
          @files_uploaded="files_uploaded"
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
  const stepper_tree = inject("stepper_tree")
  const { route_prefix } = stepper_tree

  const props = defineProps({
    multiple: { type: Boolean, required: true },
    input_geode_object: { type: String, required: true },
    files: { type: Array, required: true },
    schema: { type: Object, required: true },
  })

  const { multiple, input_geode_object, files, schema } = props

  const accept = ref("")
  const loading = ref(false)
  const has_missing_files = ref(false)
  const mandatory_files = ref([])
  const additional_files = ref([])
  const toggle_loading = useToggle(loading)

  function files_uploaded(value) {
    stepper_tree["additional_files"] = value
    console.log("files_uploaded")
    missing_files()
  }

  async function missing_files() {
    has_missing_files.value = false
    mandatory_files.value = []
    additional_files.value = []
    toggle_loading()
    for (const file of files) {
      const params = { input_geode_object, filename: file.name }
      await api_fetch(
        { schema, params },
        {
          response_function: (response) => {
            has_missing_files.value = response._data.has_missing_files
            mandatory_files.value = [].concat(
              mandatory_files.value,
              response._data.mandatory_files,
            )
            additional_files.value = [].concat(
              additional_files.value,
              response._data.additional_files,
            )
            const files_list = [].concat(
              mandatory_files.value,
              additional_files.value,
            )
            accept.value = files_list
              .map((filename) => "." + filename.split(".").pop())
              .join(",")
            if (!has_missing_files.value) {
              stepper_tree["current_step_index"]++
            }
          },
        },
      )
    }
    toggle_loading()
  }

  onMounted(() => {
    missing_files()
  })
</script>
