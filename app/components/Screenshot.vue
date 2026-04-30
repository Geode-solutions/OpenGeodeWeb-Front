<script setup>
import ToolPanel from "@ogw_front/components/ToolPanel";
import fileDownload from "js-file-download";
import { useViewerStore } from "@ogw_front/stores/viewer";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_schemas.json";

const show = defineModel({ type: Boolean, default: false });

const { width } = defineProps({
  width: { type: Number, default: 400 },
});

const output_extensions =
  viewer_schemas.opengeodeweb_viewer.viewer.take_screenshot.properties.output_extension.enum;
const filename = ref("");
const output_extension = ref("png");
const include_background = ref(true);

async function takeScreenshot() {
  const viewerStore = useViewerStore();
  await viewerStore.request(
    viewer_schemas.opengeodeweb_viewer.viewer.take_screenshot,
    {
      filename: filename.value,
      output_extension: output_extension.value,
      include_background: include_background.value,
    },
    {
      response_function: (response) => {
        fileDownload(response.blob, `${filename.value}.${output_extension.value}`);
      },
    },
  );
  show.value = false;
}

watch(output_extension, (value) => {
  if (value !== "png") {
    include_background.value = true;
  }
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
  </ToolPanel>
</template>
