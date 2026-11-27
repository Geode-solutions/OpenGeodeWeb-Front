<script setup lang="ts">
import type { FileName, MimeType } from "@ogw_front/types/files";
import {
  MAX_SCREENSHOT_SIZE,
  MIN_SCREENSHOT_SIZE,
  useScreenshotSize,
} from "@ogw_front/composables/screenshot_size";
import type { Message, Pixels } from "@ogw_front/types/ui";
import viewer_schemas, {
  type ViewerTakeScreenshotParams,
} from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";
import ToolPanel from "@ogw_front/components/ToolPanel.vue";
import fileDownload from "js-file-download";
import { useClipboardItems } from "@vueuse/core";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { useViewerStore } from "@ogw_front/stores/viewer";
import { withViewerMarker } from "@ogw_front/composables/orientation_overlay";

// The options of a capture of the current browser tab

interface Props {
  width?: Pixels;
  escapeFunction: () => void;
}

interface TabCaptureOptions extends DisplayMediaStreamOptions {
  preferCurrentTab: boolean;
}

const DEFAULT_PANEL_WIDTH = 260;
const EXTENSION_SELECT_WIDTH = 80;

const show = defineModel<boolean>({ default: false });

const { width = DEFAULT_PANEL_WIDTH, escapeFunction } = defineProps<Props>();

function getErrorMessage(error: unknown): Message {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

const output_extensions =
  viewer_schemas.opengeodeweb_viewer.viewer.take_screenshot.properties.output_extension.enum;
const filename = ref<FileName>("");
const output_extension = ref<ViewerTakeScreenshotParams["output_extension"]>("png");
const include_background = ref<boolean>(true);
const include_ui = ref<boolean>(false);
const screenshot_type = ref<string>("file");
const { screenshot_size, displayed_size, resetSize, setWidth, setHeight } =
  useScreenshotSize(include_ui);

const { copy } = useClipboardItems();

async function deliverScreenshot(
  blob: Blob | Uint8Array,
  currentFilename: FileName,
): Promise<void> {
  const feedbackStore = useFeedbackStore();
  if (screenshot_type.value === "file") {
    fileDownload(blob, `${currentFilename}.${output_extension.value}`);
    feedbackStore.add_success("Screenshot downloaded");
    return;
  }
  try {
    const pngBlob = new Blob([blob], { type: "image/png" });
    await copy([new ClipboardItem({ "image/png": pngBlob })]);
    feedbackStore.add_success("Screenshot copied to clipboard");
  } catch (error) {
    const message = getErrorMessage(error);
    feedbackStore.add_error(
      0,
      "",
      "Clipboard Error",
      `Failed to copy screenshot to clipboard: ${message}`,
    );
  }
}

async function takeSceneScreenshot(currentFilename: FileName): Promise<void> {
  const viewerStore = useViewerStore();
  const dataStyleStore = useDataStyleStore();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.take_screenshot;
  const params = {
    filename: currentFilename,
    output_extension: output_extension.value,
    include_background: include_background.value,
    ...screenshot_size.value,
  };
  // The front orientation overlay is not part of the viewer image: the viewer draws its marker for the capture
  await withViewerMarker(
    dataStyleStore.sceneStyle.orientation_widget,
    (args) => viewerStore.request(args),
    async () => {
      await viewerStore.request(
        {
          schema,
          params,
        },
        {
          // `blob` is the image file content, received as binary (Uint8Array) through wslink
          response_function: async ({ blob }) => {
            await deliverScreenshot(blob, currentFilename);
          },
        },
      );
    },
  );
}

// `preferCurrentTab` is not yet part of the TypeScript DOM lib

// Captures the whole browser tab (scene and web UI) through the native screen capture API
async function captureTab(mimeType: MimeType): Promise<Blob> {
  const options: TabCaptureOptions = { video: true, audio: false, preferCurrentTab: true };
  const stream = await navigator.mediaDevices.getDisplayMedia(options);
  try {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    await video.play();
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    // oxlint-disable-next-line promise/avoid-new
    return await new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to encode the captured frame"));
        }
      }, mimeType);
    });
  } finally {
    for (const track of stream.getTracks()) {
      track.stop();
    }
  }
}

async function takeUiScreenshot(currentFilename: FileName): Promise<void> {
  const feedbackStore = useFeedbackStore();
  const mimeType = output_extension.value === "jpg" ? "image/jpeg" : "image/png";
  try {
    const blob = await captureTab(mimeType);
    await deliverScreenshot(blob, currentFilename);
  } catch (error) {
    const message = getErrorMessage(error);
    feedbackStore.add_error(0, "", "Screenshot Error", `Failed to capture the page: ${message}`);
  }
}

async function takeScreenshot(): Promise<void> {
  const currentFilename = screenshot_type.value === "file" ? filename.value : "screenshot";
  if (include_ui.value) {
    // Close the panel first so it does not appear on the captured page
    show.value = false;
    await nextTick();
    await takeUiScreenshot(currentFilename);
  } else {
    await takeSceneScreenshot(currentFilename);
    show.value = false;
  }
}

watch([output_extension, include_ui], ([extension, with_ui]) => {
  if (extension !== "png" || with_ui) {
    include_background.value = true;
  }
});

watch(
  show,
  (opened) => {
    if (opened) {
      resetSize();
    }
  },
  { immediate: true },
);

watch(screenshot_type, (value) => {
  if (value === "clipboard") {
    output_extension.value = "png";
  }
});

function handleClose(): void {
  if (escapeFunction) {
    escapeFunction();
  }
  show.value = false;
}
</script>

<template>
  <ToolPanel
    v-model="show"
    title="Take a screenshot"
    :width="width"
    close-label="Cancel"
    action-label="Screenshot"
    :escapeFunction="escapeFunction"
    @action="takeScreenshot"
  >
    <v-container class="pa-3 py-1">
      <v-row justify="center" dense>
        <v-col cols="12" class="py-0 d-flex justify-center">
          <v-btn-toggle
            v-model="screenshot_type"
            mandatory
            color="primary"
            variant="outlined"
            class="mb-2"
            density="compact"
          >
            <v-btn
              value="file"
              prepend-icon="ph-file-arrow-down"
              size="small"
              data-testid="screenshotFileButton"
              class="text-caption text-none"
            >
              File
            </v-btn>
            <v-btn
              data-testid="screenshotClipboardButton"
              value="clipboard"
              prepend-icon="ph-copy"
              size="small"
              class="text-caption text-none"
            >
              Clipboard
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>

      <v-row dense v-if="screenshot_type === 'file'" class="flex-nowrap">
        <v-col class="py-1">
          <v-text-field
            data-testid="screenshotFileNameInput"
            v-model="filename"
            label="File name"
            variant="outlined"
            density="compact"
            hide-details
            class="text-caption"
          ></v-text-field>
        </v-col>
        <v-col class="py-1 flex-grow-0" :style="{ minWidth: `${EXTENSION_SELECT_WIDTH}px` }">
          <v-select
            v-model="output_extension"
            :items="output_extensions"
            label="Ext."
            variant="outlined"
            density="compact"
            data-testid="screenshotExtensionSelect"
            hide-details
            required
            class="text-caption"
          />
        </v-col>
      </v-row>

      <v-row dense class="flex-nowrap align-center">
        <v-col class="py-1">
          <v-number-input
            data-testid="screenshotWidthInput"
            :model-value="displayed_size.width"
            :min="MIN_SCREENSHOT_SIZE"
            :max="MAX_SCREENSHOT_SIZE"
            :readonly="include_ui"
            :prefix="include_ui ? '≈' : undefined"
            label="Width"
            control-variant="hidden"
            variant="outlined"
            density="compact"
            hide-details
            class="text-caption"
            @update:model-value="setWidth"
          />
        </v-col>
        <span class="text-caption">×</span>
        <v-col class="py-1">
          <v-number-input
            data-testid="screenshotHeightInput"
            :model-value="displayed_size.height"
            :min="MIN_SCREENSHOT_SIZE"
            :max="MAX_SCREENSHOT_SIZE"
            :readonly="include_ui"
            :prefix="include_ui ? '≈' : undefined"
            label="Height"
            control-variant="hidden"
            variant="outlined"
            density="compact"
            hide-details
            class="text-caption"
            @update:model-value="setHeight"
          />
        </v-col>
        <span class="text-caption">px</span>
        <v-icon icon="ph-lock" size="small" class="ml-1" title="Aspect ratio locked to the view" />
      </v-row>

      <v-row dense class="flex-nowrap">
        <v-col class="py-0">
          <v-switch
            data-testid="screenshotIncludeUiSwitch"
            v-model="include_ui"
            label="Include UI"
            density="compact"
            hide-details
            inset
            class="text-caption"
          ></v-switch>
        </v-col>
        <v-col class="py-0">
          <v-switch
            data-testid="screenshotIncludeBackgroundSwitch"
            v-model="include_background"
            :disabled="(screenshot_type === 'file' && output_extension !== 'png') || include_ui"
            label="Background"
            density="compact"
            hide-details
            inset
            class="text-caption"
          ></v-switch>
        </v-col>
      </v-row>
    </v-container>

    <template #actions>
      <v-card-actions class="justify-center pb-3 pt-0" style="gap: 8px">
        <v-btn
          variant="text"
          size="small"
          data-testid="screenshotCancelButton"
          class="text-caption text-none"
          @click="handleClose"
        >
          Cancel
        </v-btn>
        <v-btn
          data-testid="screenshotActionButton"
          variant="outlined"
          size="small"
          class="text-caption text-none"
          :disabled="(screenshot_type === 'file' && !filename) || !output_extension"
          @click="takeScreenshot()"
        >
          Screenshot
        </v-btn>
      </v-card-actions>
    </template>
  </ToolPanel>
</template>
