<script setup lang="ts">
import { cameraViewBasis, toCameraPose } from "@ogw_front/utils/orientation_gizmo";
import {
  compassDialPoint,
  compassHeading,
  compassTilt,
  northUpCameraPose,
} from "@ogw_front/utils/orientation_compass";
import type { CameraOptions } from "@ogw_internal/stores/hybrid_viewer/vtk_types";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

// Compass in the app theme: the dial turns with the camera heading (north = world +Y) and flattens
// With its elevation; the letters stay upright. A click turns the camera back to north.
// Drawing units of the dial; it is displayed at DISPLAY_SIZE, the size of the axes globe backdrop
// (Viewer/OrientationGlobe.vue) so both markers take the same place in the viewer
const SIZE = 92;
const HALF_SIZE = SIZE / 2;
const DISPLAY_SIZE = 88;
const TICK_OUTER_RADIUS = 40;
const TICK_INNER_RADIUS = 36.5;
const CARDINAL_TICK_INNER_RADIUS = 33;
const LETTER_RADIUS = 26;
const NEEDLE_LENGTH = 18;
const NEEDLE_HALF_WIDTH = 3.5;
const HUB_RADIUS = 2.5;
const TICK_STEP = 30;
const QUARTER_TURN = 90;
const FULL_TURN = 360;
const TICK_ANGLES = Array.from(
  { length: FULL_TURN / TICK_STEP },
  (_item, index) => index * TICK_STEP,
);
const LETTERS = [
  { label: "N", angle: 0 },
  { label: "E", angle: QUARTER_TURN },
  { label: "S", angle: 2 * QUARTER_TURN },
  { label: "W", angle: 3 * QUARTER_TURN },
];
const NORTH_NEEDLE = `M0 ${-NEEDLE_LENGTH} L${NEEDLE_HALF_WIDTH} 0 L${-NEEDLE_HALF_WIDTH} 0 Z`;
const SOUTH_NEEDLE = `M0 ${NEEDLE_LENGTH} L${NEEDLE_HALF_WIDTH} 0 L${-NEEDLE_HALF_WIDTH} 0 Z`;

const hybridViewerStore = useHybridViewerStore();

const basis = computed(() => {
  const pose = toCameraPose(hybridViewerStore.camera_options);
  return pose && cameraViewBasis(pose);
});

// The last readable heading is kept while the camera is rolled until no heading can be read
const heading = ref(0);
const tilt = ref(1);
watch(
  basis,
  (value) => {
    if (!value) {
      return;
    }
    heading.value = compassHeading(value) ?? heading.value;
    tilt.value = compassTilt(value);
  },
  { immediate: true },
);

const dialTransform = computed(() => `scale(1 ${tilt.value}) rotate(${-heading.value})`);
const letters = computed(() =>
  LETTERS.map(({ label, angle }) => {
    const { x, y } = compassDialPoint(angle, LETTER_RADIUS, heading.value, tilt.value);
    return { label, x, y };
  }),
);

function tickInnerRadius(angle: number): number {
  return angle % QUARTER_TURN === 0 ? CARDINAL_TICK_INNER_RADIUS : TICK_INNER_RADIUS;
}

function faceNorth(): void {
  const pose = toCameraPose(hybridViewerStore.camera_options);
  const northUp = pose && basis.value && northUpCameraPose(pose, basis.value);
  if (!northUp) {
    return;
  }
  // oxlint-disable-next-line no-unsafe-type-assertion -- camera_options holds every vtk.js camera field (getCameraOptions)
  const options = hybridViewerStore.camera_options as unknown as CameraOptions;
  // Animates the camera then syncs the remote one, which renders the viewer image
  hybridViewerStore.setCamera({
    ...options,
    focal_point: [...northUp.focal_point],
    position: [...northUp.position],
    view_up: [...northUp.view_up],
  });
}
</script>

<template>
  <button
    type="button"
    class="orientation-compass"
    data-testid="orientationCompass"
    title="Face north"
    aria-label="Compass: face north"
    @click="faceNorth"
  >
    <svg
      :width="DISPLAY_SIZE"
      :height="DISPLAY_SIZE"
      :viewBox="`${-HALF_SIZE} ${-HALF_SIZE} ${SIZE} ${SIZE}`"
      aria-hidden="true"
    >
      <g :transform="dialTransform">
        <line
          v-for="angle in TICK_ANGLES"
          :key="angle"
          class="tick"
          :y1="-tickInnerRadius(angle)"
          :y2="-TICK_OUTER_RADIUS"
          :transform="`rotate(${angle})`"
        />
        <path class="needle-south" :d="SOUTH_NEEDLE" />
        <path class="needle-north" :d="NORTH_NEEDLE" />
      </g>
      <text
        v-for="letter in letters"
        :key="letter.label"
        class="letter"
        :class="{ north: letter.label === 'N' }"
        :x="letter.x"
        :y="letter.y"
      >
        {{ letter.label }}
      </text>
      <circle class="hub" :r="HUB_RADIUS" />
    </svg>
  </button>
</template>

<style scoped>
.orientation-compass {
  display: block;
  width: 88px;
  height: 88px;
  padding: 0;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 50%;
  background: rgba(var(--v-theme-surface), 0.72);
  backdrop-filter: blur(6px);
  cursor: pointer;
  pointer-events: auto;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.orientation-compass:hover,
.orientation-compass:focus-visible {
  border-color: rgba(var(--v-theme-on-surface), 0.35);
  background: rgba(var(--v-theme-surface), 0.86);
  outline: none;
}

/* The svg is the button's content box: overflow is clipped by the border radius */
.orientation-compass svg {
  display: block;
  margin: -1px;
}

.tick {
  stroke: rgba(var(--v-theme-on-surface), 0.35);
  stroke-width: 1px;
  vector-effect: non-scaling-stroke;
}

.needle-north {
  fill: #f48830;
}

.needle-south {
  fill: rgba(var(--v-theme-on-surface), 0.35);
}

.hub {
  fill: rgb(var(--v-theme-surface));
  stroke: rgba(var(--v-border-color), var(--v-border-opacity));
  stroke-width: 1px;
  vector-effect: non-scaling-stroke;
}

.letter {
  fill: rgb(var(--v-theme-on-surface));
  font-family: var(--v-font-body, inherit);
  font-size: 11px;
  font-weight: 500;
  text-anchor: middle;
  dominant-baseline: central;
  user-select: none;
}

.letter.north {
  fill: #f48830;
  font-weight: 600;
}
</style>
