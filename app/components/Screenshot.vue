<script setup>
import GlassCard from "@ogw_front/components/GlassCard";
import fileDownload from "js-file-download";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { useViewerStore } from "@ogw_front/stores/viewer";

const emit = defineEmits(["close"]);

const { show_dialog, width } = defineProps({
  show_dialog: { type: Boolean, required: true },
  width: { type: Number, required: false, default: 400 },
});

const output_extensions =
  viewer_schemas.opengeodeweb_viewer.viewer.take_screenshot.properties
    .output_extension.enum;
const filename = ref("");
const output_extension = ref("png");
const include_background = ref(true);
const screenshot_type = ref("file");

async function takeScreenshot() {
  const viewerStore = useViewerStore();
  const feedbackStore = useFeedbackStore();
  const current_filename =
    screenshot_type.value === "file" ? filename.value : "screenshot";
  await viewerStore.request(
    viewer_schemas.opengeodeweb_viewer.viewer.take_screenshot,
    {
      filename: current_filename,
      output_extension: output_extension.value,
      include_background: include_background.value,
    },
    {
      response_function: async (response) => {
        if (screenshot_type.value === "file") {
          fileDownload(
            response.blob,
            `${current_filename}.${output_extension.value}`,
          );
          feedbackStore.add_success("Screenshot downloaded");
        } else {
          try {
            const pngBlob = new Blob([response.blob], { type: "image/png" });
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": pngBlob }),
            ]);
            feedbackStore.add_success("Screenshot copied to clipboard");
          } catch (error) {
            feedbackStore.add_error(
              undefined,
              undefined,
              "Clipboard Error",
              `Failed to copy screenshot to clipboard: ${error.message}`,
            );
          }
        }
      },
    },
  );
  emit("close");
}

watch(output_extension, (value) => {
  if (value !== "png") {
    include_background.value = true;
  }
});

watch(screenshot_type, (value) => {
  if (value === "clipboard") {
    output_extension.value = "png";
  }
});
</script>
<template>
  <GlassCard
    v-if="show_dialog"
    @click.stop
    title="Take a screenshot"
    :width="width"
    :ripple="false"
    variant="panel"
    padding="pa-0"
    class="position-absolute elevation-24"
    style="z-index: 2; top: 90px; right: 55px"
  >
    <v-card-text class="pa-5">
      <v-container>
        <v-row justify="center">
          <v-col cols="12" class="py-0 d-flex justify-center">
            <v-btn-toggle
              v-model="screenshot_type"
              mandatory
              color="primary"
              variant="outlined"
              class="mb-4"
              density="comfortable"
            >
              <v-btn value="file" prepend-icon="mdi-file-download-outline">
                File
              </v-btn>
              <v-btn value="clipboard" prepend-icon="mdi-content-copy">
                Clipboard
              </v-btn>
            </v-btn-toggle>
          </v-col>
        </v-row>
        <v-row v-if="screenshot_type === 'file'">
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
              :disabled="
                screenshot_type === 'file' && output_extension !== 'png'
              "
              label="Include background"
              inset
            ></v-switch>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>

    <template #actions>
      <v-card-actions class="justify-center pb-4">
        <v-btn variant="text" color="primary" @click="emit('close')">
          Close
        </v-btn>
        <v-btn
          variant="outlined"
          :disabled="
            (screenshot_type === 'file' && !filename) || !output_extension
          "
          color="primary"
          @click="takeScreenshot()"
        >
          Screenshot
        </v-btn>
      </v-card-actions>
    </template>
  </GlassCard>
</template>
