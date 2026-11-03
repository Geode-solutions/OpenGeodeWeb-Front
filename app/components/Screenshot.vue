<script setup lang="ts">
import viewer_schemas, {
  type ViewerTakeScreenshotParams,
} from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";
import { BACKGROUND_GREY_VALUE } from "@ogw_internal/stores/hybrid_viewer/constants";
import type { RGBAColor } from "@ogw_front/utils/default_styles/constants";
import ToolPanel from "@ogw_front/components/ToolPanel.vue";
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";
import fileDownload from "js-file-download";
import { useClipboardItems } from "@vueuse/core";
import { useFeedbackStore } from "@ogw_front/stores/feedback";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useViewerStore } from "@ogw_front/stores/viewer";

const DEFAULT_PANEL_WIDTH = 260;

const show = defineModel<boolean>({ default: false });

interface Props {
  width?: number;
  escapeFunction?: () => void;
}

const { width = DEFAULT_PANEL_WIDTH, escapeFunction = undefined } = defineProps<Props>();

const output_extensions =
  viewer_schemas.opengeodeweb_viewer.viewer.take_screenshot.properties.output_extension.enum;
const filename = ref<string>("");
const output_extension = ref<ViewerTakeScreenshotParams["output_extension"]>("png");
const include_background = ref<boolean>(true);
const include_ui = ref<boolean>(false);
const screenshot_type = ref<string>("file");
const DEFAULT_BACKGROUND_COLOR: RGBAColor = {
  red: BACKGROUND_GREY_VALUE,
  green: BACKGROUND_GREY_VALUE,
  blue: BACKGROUND_GREY_VALUE,
  alpha: 1,
};
const background_color = ref<RGBAColor>({ ...DEFAULT_BACKGROUND_COLOR });
let is_capturing = false;

const { copy } = useClipboardItems();

function applyBackgroundColor(color: RGBAColor): Promise<void> {
  const hybridViewerStore = useHybridViewerStore();
  // oxlint-disable-next-line id-length -- the viewer schema requires { r, g, b }
  return hybridViewerStore.setBackgroundColor({ r: color.red, g: color.green, b: color.blue });
}

async function restoreBackgroundColor(): Promise<void> {
  background_color.value = { ...DEFAULT_BACKGROUND_COLOR };
  await applyBackgroundColor(DEFAULT_BACKGROUND_COLOR);
}

async function deliverScreenshot(blob: Blob | Uint8Array, current_filename: string): Promise<void> {
  const feedbackStore = useFeedbackStore();
  if (screenshot_type.value === "file") {
    fileDownload(blob, `${current_filename}.${output_extension.value}`);
    feedbackStore.add_success("Screenshot downloaded");
    return;
  }
  try {
    const pngBlob = new Blob([blob], { type: "image/png" });
    await copy([new ClipboardItem({ "image/png": pngBlob })]);
    feedbackStore.add_success("Screenshot copied to clipboard");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    feedbackStore.add_error(
      0,
      "",
      "Clipboard Error",
      `Failed to copy screenshot to clipboard: ${message}`,
    );
  }
}

async function takeSceneScreenshot(current_filename: string): Promise<void> {
  const viewerStore = useViewerStore();
  const schema = viewer_schemas.opengeodeweb_viewer.viewer.take_screenshot;
  const params = {
    filename: current_filename,
    output_extension: output_extension.value,
    include_background: include_background.value,
  };
  await viewerStore.request(
    {
      schema,
      params,
    },
    {
      // `blob` is the image file content, received as binary (Uint8Array) through wslink
      response_function: async ({ blob }) => {
        await deliverScreenshot(blob, current_filename);
      },
    },
  );
}

// `preferCurrentTab` is not yet part of the TypeScript DOM lib
interface TabCaptureOptions extends DisplayMediaStreamOptions {
  preferCurrentTab: boolean;
}

// Captures the whole browser tab (scene and web UI) through the native screen capture API
async function captureTab(mime_type: string): Promise<Blob> {
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
      }, mime_type);
    });
  } finally {
    for (const track of stream.getTracks()) {
      track.stop();
    }
  }
}

async function takeUiScreenshot(current_filename: string): Promise<void> {
  const feedbackStore = useFeedbackStore();
  const mime_type = output_extension.value === "jpg" ? "image/jpeg" : "image/png";
  try {
    const blob = await captureTab(mime_type);
    await deliverScreenshot(blob, current_filename);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    feedbackStore.add_error(0, "", "Screenshot Error", `Failed to capture the page: ${message}`);
  }
}

async function takeScreenshot(): Promise<void> {
  const current_filename = screenshot_type.value === "file" ? filename.value : "screenshot";
  is_capturing = true;
  try {
    if (include_ui.value) {
      // Close the panel first so it does not appear on the captured page
      show.value = false;
      await nextTick();
      await takeUiScreenshot(current_filename);
    } else {
      await takeSceneScreenshot(current_filename);
      show.value = false;
    }
  } finally {
    await restoreBackgroundColor();
    is_capturing = false;
  }
}

watch(background_color, async (color) => {
  if (show.value) {
    await applyBackgroundColor(color);
  }
});

watch(show, async (value) => {
  if (!value && !is_capturing) {
    await restoreBackgroundColor();
  }
});

watch([output_extension, include_ui], ([extension, with_ui]) => {
  if (extension !== "png" || with_ui) {
    include_background.value = true;
  }
});

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
              prepend-icon="mdi-file-download-outline"
              size="small"
              data-testid="screenshotFileButton"
              class="text-caption text-none"
            >
              File
            </v-btn>
            <v-btn
              data-testid="screenshotClipboardButton"
              value="clipboard"
              prepend-icon="mdi-content-copy"
              size="small"
              class="text-caption text-none"
            >
              Clipboard
            </v-btn>
          </v-btn-toggle>
        </v-col>
      </v-row>

      <v-row dense v-if="screenshot_type === 'file'">
        <v-col cols="12" class="py-1">
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
        <v-col cols="12" class="py-1">
          <v-select
            v-model="output_extension"
            :items="output_extensions"
            label="Extension"
            variant="outlined"
            density="compact"
            data-testid="screenshotExtensionSelect"
            hide-details
            required
            class="text-caption"
          />
        </v-col>
      </v-row>

      <v-row dense>
        <v-col cols="12" class="py-1">
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
        <v-col cols="12" class="py-1">
          <v-switch
            data-testid="screenshotIncludeBackgroundSwitch"
            v-model="include_background"
            :disabled="(screenshot_type === 'file' && output_extension !== 'png') || include_ui"
            label="Include background"
            density="compact"
            hide-details
            inset
            class="text-caption"
          ></v-switch>
        </v-col>
        <v-col v-if="include_background" cols="12" class="py-1">
          <span class="text-caption">Background color</span>
          <ViewerOptionsColorPicker
            data-testid="screenshotBackgroundColorPicker"
            v-model="background_color"
            disabled-alpha
          />
        </v-col>
      </v-row>
    </v-container>

    <template #actions>
      <v-card-actions class="justify-center pb-3 pt-0" style="gap: 8px">
        <v-btn
          variant="text"
          size="small"
          color="white"
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
          color="white"
          @click="takeScreenshot()"
        >
          Screenshot
        </v-btn>
      </v-card-actions>
    </template>
  </ToolPanel>
</template>
