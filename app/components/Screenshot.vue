<template>
  <v-sheet
    v-if="props.show_dialog"
    :width="props.width + 'px'"
    class="screenshot_menu"
    border="md"
  >
    <v-card class="bg-primary pa-0">
      <v-card-title>
        <h3 class="mt-4">Take a screenshot</h3>
      </v-card-title>
      <v-card-text class="pa-0">
        <v-container>
          <v-row>
            <v-col cols="8" class="py-0">
              <v-text-field v-model="filename" label="File name"></v-text-field>
            </v-col>
            <v-col cols="4" class="py-0">
              <v-select
                v-model="output_extension"
                :items="output_extensions"
                label="Extension"
                required
              />
            </v-col>
          </v-row>

          <v-row>
            <v-col cols="12" class="py-0">
              <v-switch
                v-model="include_background"
                :disabled="output_extension !== 'png'"
                label="Include background"
                inset
              ></v-switch>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
      <v-card-actions justify-center>
        <v-btn
          variant="outlined"
          color="white"
          text
          @click="emit('close')"
          class="ml-8 mb-4"
          >Close</v-btn
        >
        <v-btn
          variant="outlined"
          class="mb-4"
          :disabled="!filename || !output_extension"
          color="white"
          text
          @click="takeScreenshot()"
          >Screenshot</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-sheet>
</template>

<script setup>
  import fileDownload from "js-file-download"
  import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

  const emit = defineEmits(["close"])

  const props = defineProps({
    show_dialog: { type: Boolean, required: true },
    width: { type: Number, required: false, default: 400 },
  })

  const output_extensions =
    viewer_schemas.opengeodeweb_viewer.viewer.take_screenshot.properties
      .output_extension.enum
  const filename = ref("")
  const output_extension = ref("png")
  const include_background = ref(true)

  async function takeScreenshot() {
    const viewerStore = useViewerStore()
    await viewer_call(
      viewerStore,
      {
        schema: viewer_schemas.opengeodeweb_viewer.viewer.take_screenshot,
        params: {
          filename: filename.value,
          output_extension: output_extension.value,
          include_background: include_background.value,
        },
      },
      {
        response_function: async (response) => {
          fileDownload(
            response.blob,
            filename.value + "." + output_extension.value,
          )
        },
      },
    )
    emit("close")
  }

  watch(output_extension, (value) => {
    if (value !== "png") {
      include_background.value = true
    }
  })
</script>

<style scoped>
  .screenshot_menu {
    position: absolute;
    z-index: 2;
    top: 90px;
    right: 55px;
  }
</style>
