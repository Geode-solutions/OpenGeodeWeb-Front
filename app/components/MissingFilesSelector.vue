<script setup>
  import schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"

  import FetchingData from "@ogw_front/components/FetchingData"
  import FileUploader from "@ogw_front/components/FileUploader"
  import { useGeodeStore } from "@ogw_front/stores/geode"

  const schema = schemas.opengeodeweb_back.missing_files

  const emit = defineEmits([
    "update_values",
    "increment_step",
    "decrement_step",
  ])

  const { multiple, geode_object_type, filenames } = defineProps({
    multiple: { type: Boolean, required: true },
    geode_object_type: { type: String, required: true },
    filenames: { type: Array, required: true },
  })

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

    const promise_array = filenames.map(async (filename) => {
      const response = await geodeStore.request(schema, {
        geode_object_type,
        filename,
      })
      return response
    })
    const values = await Promise.all(promise_array)
    for (const value of values) {
      if (value.has_missing_files) {
        has_missing_files.value = true
      }
      mandatory_files.value = [
        ...mandatory_files.value,
        ...value.mandatory_files,
      ]
      additional_files.value = [
        ...additional_files.value,
        ...value.additional_files,
      ]
    }
    if (has_missing_files.value) {
      accept.value = [...mandatory_files.value, ...additional_files.value]
        .map((filename) => `.${filename.split(".").pop()}`)
        .join(",")
    } else {
      emit("increment_step")
    }
    toggle_loading()
  }

  await missing_files()
</script>

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
        v-if="mandatory_files.length === 0 && additional_files.length > 0"
        cols="auto"
      >
        <v-btn @click="emit('increment_step')" color="warning">Skip step</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
