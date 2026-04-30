<script setup>
import ToolPanel from "@ogw_front/components/ToolPanel";
import fileDownload from "js-file-download";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

import { useViewerStore } from "@ogw_front/stores/viewer";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

const show = defineModel({ type: Boolean, default: false });

const { width } = defineProps({
  width: { type: Number, default: 400 },
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
  show.value = false;
}

watch(output_extension, (value) => {
  if (value !== "png") include_background.value = true;
});

watch(screenshot_type, (value) => {
  if (value === "clipboard") output_extension.value = "png";
});
</script>

<template>
  <ToolPanel
    v-model="show"
    title="Take a screenshot"
    :width="width"
    close-label="Cancel"
    action-label="Screenshot"
    @action="takeScreenshot"
  >
    <v-container class="pa-5">
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
            :disabled="screenshot_type === 'file' && output_extension !== 'png'"
            label="Include background"
            inset
          ></v-switch>
        </v-col>
      </v-row>
    </v-container>

    <template #actions>
      <v-card-actions class="justify-center pb-6" style="gap: 12px">
        <v-btn variant="text" size="small" color="white" @click="show = false">
          Cancel
        </v-btn>
        <v-btn
          variant="outlined"
          size="small"
          :disabled="
            (screenshot_type === 'file' && !filename) || !output_extension
          "
          color="white"
          @click="takeScreenshot()"
        >
          Screenshot
        </v-btn>
      </v-card-actions>
    </template>
  </ToolPanel>
</template>
