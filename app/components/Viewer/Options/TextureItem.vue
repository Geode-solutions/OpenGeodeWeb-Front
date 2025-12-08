<template>
  <v-col cols="7" class="pa-1 ml-3">
    <v-select
      v-model="texture_name"
      :items="texture_coordinates"
      label="Select a texture"
      density="compact"
    />
  </v-col>
  <v-badge
    :model-value="texture_file_name != ''"
    color="white"
    floating
    dot
    offset-x="10"
    offset-y="10"
  >
    <v-col cols="1" class="ma-1" justify="center" align="center">
      <FileUploader
        @files_uploaded="files_uploaded_event($event, index)"
        :accept="['image/png', 'image/jpeg', 'image/bmp']"
        :auto_upload="true"
        :multiple="true"
        :mini="true"
        class="mt-2"
      />
    </v-col>
  </v-badge>
  <v-col v-if="texture_name == '' || texture_file_name == ''" cols="1">
    <v-icon
      size="20"
      icon="mdi-close-circle"
      v-tooltip:bottom="'Invalid texture'"
    />
  </v-col>
</template>

<script setup>
  import back_schemas from "@geode/opengeodeweb-back/opengeodeweb_back_schemas.json"
  import FileUploader from "@ogw_front/components/FileUploader.vue"
  import { useGeodeStore } from "@ogw_front/stores/geode"

  const emit = defineEmits(["update_value"])

  const props = defineProps({
    id: { type: String, required: true },
    texture_id: { type: String, required: true },
    texture_name: { type: String, required: true },
  })

  const texture_name = ref("")
  texture_name.value = props.texture_name

  const texture_id = ref("")
  texture_id.value = props.texture_id

  const texture_coordinates = ref([])
  const geodeStore = useGeodeStore()

  onMounted(() => {
    getTextureCoordinates()
  })

  function getTextureCoordinates() {
    geodeStore.request(
      back_schemas.opengeodeweb_back.texture_coordinates,
      { id: props.id },
      {
        response_function: (response) => {
          texture_coordinates.value = response._data.texture_coordinates
        },
      },
    )
  }

  async function files_uploaded_event(value) {
    if (value.length) {
      await geodeStore.request(
        back_schemas.opengeodeweb_back.save_viewable_file,
        {
          schema: back_schemas.opengeodeweb_back.save_viewable_file,
          params: {
            geode_object_type: "RasterImage2D",
            filename: value[0].name,
          },
        },
        {
          response_function: async (response) => {
            texture_id.value = response._data.id
          },
        },
      )
    }
  }

  watch(texture_name, (value) => {
    emit("update_value", { key: "texture_name", value })
  })

  watch(texture_id, (value) => {
    emit("update_value", { key: "id", value })
  })
</script>

<style>
  .v-input__details {
    display: none;
  }
</style>
