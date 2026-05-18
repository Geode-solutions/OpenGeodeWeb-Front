import { computed, ref, watch } from "vue";
import { useElementBounding, useThrottleFn } from "@vueuse/core";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const LUMINANCE_THRESHOLD = 0.65;
const ADAPTIVE_EXPONENT = 0.3;

const MIN_BLUR = 8;
const MAX_BLUR = 25;

const MIN_OPACITY = 0;
const MAX_OPACITY = 0.85;

const MIN_BOOST = 1;
const MAX_BOOST = 1.2;
const ADAPTIVE_REFRESH_RATE = 150;

export function useAdaptiveStyles(target) {
  const hybridViewerStore = useHybridViewerStore();
  
  let x, y, width, height;
  if (target && (target.value !== undefined || typeof target === "function" || target.x !== undefined)) {
    const unwrapped = computed(() => {
      const val = typeof target === "function" ? target() : (target.value !== undefined ? target.value : target);
      return {
        x: typeof val?.x === "object" && val.x !== null && val.x.value !== undefined ? val.x.value : (val?.x ?? 0),
        y: typeof val?.y === "object" && val.y !== null && val.y.value !== undefined ? val.y.value : (val?.y ?? 0),
        width: typeof val?.width === "object" && val.width !== null && val.width.value !== undefined ? val.width.value : (val?.width ?? 0),
        height: typeof val?.height === "object" && val.height !== null && val.height.value !== undefined ? val.height.value : (val?.height ?? 0),
      };
    });
    x = computed(() => unwrapped.value.x);
    y = computed(() => unwrapped.value.y);
    width = computed(() => unwrapped.value.width);
    height = computed(() => unwrapped.value.height);
  } else {
    const bounding = useElementBounding(target);
    x = bounding.x;
    y = bounding.y;
    width = bounding.width;
    height = bounding.height;
  }
  const brightness = ref(LUMINANCE_THRESHOLD);

  const updateBrightness = useThrottleFn(() => {
    brightness.value = hybridViewerStore.getAverageBrightness({
      x: x.value,
      y: y.value,
      width: width.value,
      height: height.value,
    });
  }, ADAPTIVE_REFRESH_RATE);

  watch([x, y, width, height, () => hybridViewerStore.latestImage], updateBrightness, {
    immediate: true,
  });

  const adaptiveStyles = computed(() => {
    const normalized = Math.min(1, brightness.value / LUMINANCE_THRESHOLD);
    const darkFactor = (1 - normalized) ** ADAPTIVE_EXPONENT;

    const blur = MIN_BLUR + darkFactor * (MAX_BLUR - MIN_BLUR);
    const opacity = MIN_OPACITY + darkFactor * (MAX_OPACITY - MIN_OPACITY);
    const brightnessBoost = MIN_BOOST + darkFactor * (MAX_BOOST - MIN_BOOST);

    return {
      "--adaptive-blur": `${blur}px`,
      "--adaptive-opacity": opacity,
      "--adaptive-brightness": brightnessBoost,
    };
  });

  return {
    adaptiveStyles,
    brightness,
  };
}
