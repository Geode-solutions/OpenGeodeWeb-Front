import { computed, ref, watch } from "vue";
import { useElementBounding, useThrottleFn } from "@vueuse/core";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const LUMINANCE_THRESHOLD = 0.65;
const ADAPTIVE_EXPONENT = 0.3;

const MIN_BLUR = 8;
const MAX_BLUR = 25;

const MIN_OPACITY = 0;
const MAX_OPACITY = 0.5;

const MIN_BOOST = 1;
const MAX_BOOST = 1.2;
const ADAPTIVE_REFRESH_RATE = 150;

export function useAdaptiveStyles(targetRef) {
  const hybridViewerStore = useHybridViewerStore();
  const { x, y, width, height } = useElementBounding(targetRef);
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
