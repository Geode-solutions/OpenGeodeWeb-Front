import { useElementBounding, useThrottleFn } from "@vueuse/core";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

const LUMINANCE_THRESHOLD = 0.65;
const ADAPTIVE_EXPONENT = 0.3;

const MIN_BLUR = 8;
const MAX_BLUR = 25;

const MIN_OPACITY = 0;
const MAX_OPACITY = 0.5;

const MIN_BOOST = 1;
const MAX_BOOST = 1.2;
const ADAPTIVE_REFRESH_RATE = 150;

function getValue(val) {
  if (typeof val === "object" && val !== null && val.value !== undefined) {
    return val.value;
  }
  return val ?? 0;
}

// oxlint-disable max-lines-per-function
export function useAdaptiveStyles(target, options = {}) {
  const hybridViewerStore = useHybridViewerStore();
  const treeviewStore = useTreeviewStore();

  const isCoordinates =
    target &&
    (typeof target === "function" ||
      (target.value !== undefined && target.value !== null && target.value.x !== undefined) ||
      (target.x !== undefined && target.value === undefined));

  const bounding = useElementBounding(isCoordinates ? undefined : target);

  const unwrapped = computed(() => {
    if (isCoordinates) {
      let val = undefined;
      if (typeof target === "function") {
        val = target();
      } else if (target.value === undefined) {
        val = target;
      } else {
        val = target.value;
      }
      return {
        x: getValue(val?.x),
        y: getValue(val?.y),
        width: getValue(val?.width),
        height: getValue(val?.height),
      };
    }
    return {
      x: bounding.x.value,
      y: bounding.y.value,
      width: bounding.width.value,
      height: bounding.height.value,
    };
  });

  const x = computed(() => unwrapped.value.x);
  const y = computed(() => unwrapped.value.y);
  const width = computed(() => unwrapped.value.width);
  const height = computed(() => unwrapped.value.height);

  const brightness = ref(LUMINANCE_THRESHOLD);

  function calculateBrightness() {
    brightness.value = hybridViewerStore.getAverageBrightness({
      x: x.value,
      y: y.value,
      width: width.value,
      height: height.value,
    });
  }

  const updateBrightness = useThrottleFn(calculateBrightness, ADAPTIVE_REFRESH_RATE);

  watch([x, y, width, height, () => hybridViewerStore.latestImage], updateBrightness, {
    immediate: true,
  });

  async function forceRefresh() {
    await nextTick();
    bounding.update?.();
    calculateBrightness();
  }

  if (getCurrentInstance()) {
    onMounted(() => {
      forceRefresh();
    });
  }

  watch(() => treeviewStore.opened_views, forceRefresh, { deep: true });

  const adaptiveStyles = computed(() => {
    const normalized = Math.min(1, brightness.value / LUMINANCE_THRESHOLD);
    const darkFactor = (1 - normalized) ** ADAPTIVE_EXPONENT;

    const blur = MIN_BLUR + darkFactor * (MAX_BLUR - MIN_BLUR);
    const minOpacity = options.minOpacity ?? MIN_OPACITY;
    const maxOpacity = options.maxOpacity ?? MAX_OPACITY;
    const opacity = minOpacity + darkFactor * (maxOpacity - minOpacity);
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
