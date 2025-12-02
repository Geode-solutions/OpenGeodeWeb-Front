<template>
  <FetchingData v-if="loading" />
  <v-container v-else-if="has_missing_files">
    <v-row v-if="mandatory_files.length" align="center">
      <v-col cols="auto" class="pa-0">
        <v-icon color="warning" icon="mdi-file-document-alert-outline" />
      </v-col>
      <p class="pa-1">Mandatory files:</p>
      <v-col v-for="mandatory_file in mandatory_files" cols="auto" class="pa-0">
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
          @files_uploaded="files_uploaded_event"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        v-if="!mandatory_files.length && additional_files.length"
        cols="auto"
      >
        <v-btn @click="emit('increment_step')" color="warning">Skip step</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

  import FetchingData from "@ogw_front/components/FetchingData.vue"
  import FileUploader from "@ogw_front/components/FileUploader.vue"

  const schema = schemas.opengeodeweb_back.missing_files

  const emit = defineEmits([
    "update_values",
    "increment_step",
    "decrement_step",
  ])

  const props = defineProps({
    multiple: { type: Boolean, required: true },
    geode_object_type: { type: String, required: true },
    filenames: { type: Array, required: true },
  })

  const { multiple, geode_object_type, filenames } = props

  const accept = ref("")
  const loading = ref(false)
  const has_missing_files = ref(false)
  const mandatory_files = ref([])
  const additional_files = ref([])
  const toggle_loading = useToggle(loading)

  function files_uploaded_event(value) {
    emit("update_values", { additional_files: value })
    emit("increment_step")
  }

  async function missing_files() {
    toggle_loading()
    has_missing_files.value = false
    mandatory_files.value = []
    additional_files.value = []
    const geodeStore = useGeodeStore()

    const promise_array = filenames.map((filename) => {
      const params = { input_geode_object, filename }
      return new Promise((resolve, reject) => {
        geodeStore.request(schema, params, {
          request_error_function: () => reject(),
          response_function: (response) => resolve(response._data),
          response_error_function: () => reject(),
        })
      })
    })
    const values = await Promise.all(promise_array)
    for (const value of values) {
      has_missing_files.value = value.has_missing_files
        ? true
        : has_missing_files.value
      mandatory_files.value = [].concat(
        mandatory_files.value,
        value.mandatory_files,
      )
      additional_files.value = [].concat(
        additional_files.value,
        value.additional_files,
      )
    }
    if (!has_missing_files.value) {
      emit("increment_step")
    } else {
      accept.value = []
        .concat(mandatory_files.value, additional_files.value)
        .map((filename) => "." + filename.split(".").pop())
        .join(",")
    }
    toggle_loading()
  }

  await missing_files()
</script>
