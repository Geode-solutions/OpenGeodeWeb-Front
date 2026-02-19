<script setup>
  import fileDownload from "js-file-download"
  import GlassCard from "@ogw_front/components/GlassCard"
  import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json"

  import { useViewerStore } from "@ogw_front/stores/viewer"

  const emit = defineEmits(["close"])

  const { show_dialog, width } = defineProps({
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
    await viewerStore.request(
      viewer_schemas.opengeodeweb_viewer.viewer.take_screenshot,
      {
        filename: filename.value,
        output_extension: output_extension.value,
        include_background: include_background.value,
      },
      {
        response_function: async (response) => {
          fileDownload(
            response.blob,
            `${filename.value}.${output_extension.value}`,
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
<template>
  <GlassCard
    v-if="props.show_dialog"
    @click.stop
    title="Take a screenshot"
    :width="props.width"
    :ripple="false"
    variant="panel"
    padding="pa-0"
    class="position-absolute elevation-24"
    style="z-index: 2; top: 90px; right: 55px"
  >
    <v-card-text class="pa-5">
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

    <template #actions>
      <v-card-actions class="justify-center pb-4">
        <v-btn variant="text" color="primary" @click="emit('close')"
          >Close</v-btn
        >
        <v-btn
          variant="outlined"
          :disabled="!filename || !output_extension"
          color="primary"
          @click="takeScreenshot()"
          >Screenshot</v-btn
        >
      </v-card-actions>
    </template>
  </GlassCard>
</template>
