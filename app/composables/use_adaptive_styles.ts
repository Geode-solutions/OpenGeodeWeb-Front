import type { MaybeComputedElementRef } from "@vueuse/core";
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

// `target` is intentionally duck-typed: callers pass either a coordinates source (a plain object, a Ref/ComputedRef of one, or a getter function returning one) or an element ref/template ref destined for vueuse's useElementBounding - see call sites in Viewer/ContextMenu and Viewer/ObjectTree components.
type AdaptiveStylesTarget = unknown;

interface AdaptiveStylesOptions {
  minOpacity?: number;
  maxOpacity?: number;
}

interface CoordinatesLike {
  x?: unknown;
  y?: unknown;
  width?: unknown;
  height?: unknown;
}

interface RefLike {
  value?: unknown;
  x?: unknown;
}

function isRefLike(value: unknown): value is RefLike {
  return typeof value === "object" && value !== null;
}

function isCoordinatesGetter(value: unknown): value is () => CoordinatesLike | undefined {
  return typeof value === "function";
}

function isCoordinatesLike(value: unknown): value is CoordinatesLike {
  return typeof value === "object" && value !== null;
}

// `useElementBounding`'s target accepts an element/ref/getter or nullish value -
// i.e. anything that isn't a primitive (string, number, boolean, bigint, symbol).
function isElementBoundingTarget(value: unknown): value is MaybeComputedElementRef {
  return (
    value === undefined ||
    value === null ||
    typeof value === "function" ||
    typeof value === "object"
  );
}

function getValue(val: unknown): number {
  if (typeof val === "object" && val !== null && "value" in val) {
    const wrapped = (val as { value?: unknown }).value;
    if (typeof wrapped === "number") {
      return wrapped;
    }
  }
  return typeof val === "number" ? val : 0;
}

// oxlint-disable max-lines-per-function
export function useAdaptiveStyles(
  target: AdaptiveStylesTarget,
  options: Readonly<AdaptiveStylesOptions> = {},
): {
  adaptiveStyles: ComputedRef<{
    "--adaptive-blur": string;
    "--adaptive-opacity": number;
    "--adaptive-brightness": number;
  }>;
  brightness: Ref<number>;
} {
  const hybridViewerStore = useHybridViewerStore();
  const treeviewStore = useTreeviewStore();

  const targetAsRefLike = isRefLike(target) ? target : undefined;
  const isCoordinates =
    target !== undefined &&
    target !== null &&
    (typeof target === "function" ||
      (targetAsRefLike?.value !== undefined &&
        targetAsRefLike.value !== null &&
        (targetAsRefLike.value as { x?: unknown }).x !== undefined) ||
      (targetAsRefLike?.x !== undefined && targetAsRefLike.value === undefined));

  const bounding = useElementBounding(isCoordinates ? undefined : (target as never));

  const unwrapped = computed(() => {
    if (isCoordinates) {
      let val: CoordinatesLike | undefined = undefined;
      if (isCoordinatesGetter(target)) {
        val = target();
      } else if (targetAsRefLike?.value === undefined) {
        val = targetAsRefLike;
      } else if (isCoordinatesLike(targetAsRefLike.value)) {
        val = targetAsRefLike.value;
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

  function calculateBrightness(): void {
    brightness.value = hybridViewerStore.getAverageBrightness({
      x: x.value,
      y: y.value,
      width: width.value,
      height: height.value,
    });
  }

  const updateBrightness = useThrottleFn(calculateBrightness, ADAPTIVE_REFRESH_RATE);

  watch(
    [
      x,
      y,
      width,
      height,
      (): typeof hybridViewerStore.latestImage => hybridViewerStore.latestImage,
    ],
    updateBrightness,
    {
      immediate: true,
    },
  );

  async function forceRefresh(): Promise<void> {
    await nextTick();
    bounding.update?.();
    calculateBrightness();
  }

  if (getCurrentInstance()) {
    onMounted(async () => {
      try {
        await forceRefresh();
      } catch (error) {
        console.error("forceRefresh failed:", error);
      }
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
