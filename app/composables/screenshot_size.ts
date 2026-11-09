// Third party imports
import { type ComputedRef, type Ref, computed, ref } from "vue";
import { useDevicePixelRatio, useWindowSize } from "@vueuse/core";
import viewer_schemas from "@geode/opengeodeweb-viewer/opengeodeweb_viewer_typed_schemas.js";

// Local imports
import { useViewerStore } from "@ogw_front/stores/viewer";

interface PixelSize {
  width: number;
  height: number;
}

interface ScreenshotSizeState {
  screenshot_size: Ref<PixelSize | undefined>;
  displayed_size: ComputedRef<Partial<PixelSize>>;
  resetSize: () => void;
  setWidth: (value: number | null | undefined) => void;
  setHeight: (value: number | null | undefined) => void;
}

// Pixel bounds accepted by the take_screenshot RPC
const size_schema = viewer_schemas.opengeodeweb_viewer.viewer.take_screenshot.properties.width;
const MIN_SCREENSHOT_SIZE = size_schema.minimum;
const MAX_SCREENSHOT_SIZE = size_schema.maximum;

function clampSize(value: number): number {
  return Math.min(MAX_SCREENSHOT_SIZE, Math.max(MIN_SCREENSHOT_SIZE, Math.round(value)));
}

function isSized({ width, height }: Readonly<PixelSize>): boolean {
  return width > 0 && height > 0;
}

// Width / height ratio of the view, 1 while the view is not sized yet (0×0)
function ratioOf(view_size: Readonly<PixelSize>): number {
  return isSized(view_size) ? view_size.width / view_size.height : 1;
}

function useScreenshotSize(include_ui: Readonly<Ref<boolean>>): ScreenshotSizeState {
  const viewerStore = useViewerStore();
  const { width: window_width, height: window_height } = useWindowSize();
  const { pixelRatio } = useDevicePixelRatio();

  // Undefined (no size sent, the server keeps its window size) until the view size is known
  const screenshot_size = ref<PixelSize>();

  function resetSize(): void {
    const { view_size } = viewerStore;
    if (isSized(view_size)) {
      screenshot_size.value = {
        width: clampSize(view_size.width),
        height: clampSize(view_size.height),
      };
    }
  }

  // `value` is null when the field is cleared (VNumberInput): keep the current size
  function setWidth(value: number | null | undefined): void {
    if (typeof value === "number") {
      // Cap the edited side so the derived one stays within the bounds and keeps the ratio
      const ratio = ratioOf(viewerStore.view_size);
      const width = clampSize(Math.min(value, MAX_SCREENSHOT_SIZE * ratio));
      const height = clampSize(width / ratio);
      screenshot_size.value = { width, height };
    }
  }

  function setHeight(value: number | null | undefined): void {
    if (typeof value === "number") {
      const ratio = ratioOf(viewerStore.view_size);
      const height = clampSize(Math.min(value, MAX_SCREENSHOT_SIZE / ratio));
      const width = clampSize(height * ratio);
      screenshot_size.value = { width, height };
    }
  }

  // With the UI included, the page is captured at the browser tab size (getDisplayMedia)
  const displayed_size = computed<Partial<PixelSize>>(() => {
    if (include_ui.value) {
      return {
        width: Math.round(window_width.value * pixelRatio.value),
        height: Math.round(window_height.value * pixelRatio.value),
      };
    }
    return { ...screenshot_size.value };
  });

  return { screenshot_size, displayed_size, resetSize, setWidth, setHeight };
}

export { MAX_SCREENSHOT_SIZE, MIN_SCREENSHOT_SIZE, useScreenshotSize };
