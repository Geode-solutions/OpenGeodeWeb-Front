<script setup lang="ts">
import { compassDialPoint, facingCameraPose, isFacing } from "@ogw_front/utils/orientation_compass";
import type { CameraOptions } from "@ogw_internal/stores/hybrid_viewer/vtk_types";
import { toCameraPose } from "@ogw_front/utils/orientation_gizmo";
import { useCompassDial } from "@ogw_front/composables/compass_dial";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

// Compass in the app theme: the dial turns with the camera heading (north = world +Y) and flattens
// With its elevation; the letters stay upright. A click on a letter turns the camera towards that
// Direction, a click anywhere else turns it back to north. Nothing happens when it already faces it.
// Drawing units of the dial; it is displayed at DISPLAY_SIZE, the size of the axes globe backdrop
// (Viewer/OrientationGlobe.vue) so both markers take the same place in the viewer
const SIZE = 92;
const HALF_SIZE = SIZE / 2;
const DISPLAY_SIZE = 88;
const TICK_OUTER_RADIUS = 40;
const TICK_INNER_RADIUS = 36.5;
const CARDINAL_TICK_INNER_RADIUS = 33;
const LETTER_RADIUS = 26;
const LETTER_HIT_RADIUS = 9;
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
const NORTH = 0;
const LETTERS = [
  { label: "N", name: "north", angle: NORTH },
  { label: "E", name: "east", angle: QUARTER_TURN },
  { label: "S", name: "south", angle: 2 * QUARTER_TURN },
  { label: "W", name: "west", angle: 3 * QUARTER_TURN },
];
const NORTH_NEEDLE = `M0 ${-NEEDLE_LENGTH} L${NEEDLE_HALF_WIDTH} 0 L${-NEEDLE_HALF_WIDTH} 0 Z`;
const SOUTH_NEEDLE = `M0 ${NEEDLE_LENGTH} L${NEEDLE_HALF_WIDTH} 0 L${-NEEDLE_HALF_WIDTH} 0 Z`;

const hybridViewerStore = useHybridViewerStore();
const { basis, heading, tilt } = useCompassDial();

const dialTransform = computed(() => `scale(1 ${tilt.value}) rotate(${-heading.value})`);
const letters = computed(() =>
  LETTERS.map(({ label, name, angle }) => {
    const { x, y } = compassDialPoint(angle, LETTER_RADIUS, heading.value, tilt.value);
    return { label, name, angle, x, y };
  }),
);

function tickInnerRadius(angle: number): number {
  return angle % QUARTER_TURN === 0 ? CARDINAL_TICK_INNER_RADIUS : TICK_INNER_RADIUS;
}

function face(targetHeading: number): void {
  // Like a click without drag in the viewer: a camera already facing that way is not moved (no viewer call)
  if (!basis.value || isFacing(basis.value, targetHeading)) {
    return;
  }
  const pose = toCameraPose(hybridViewerStore.camera_options);
  const facing = pose && facingCameraPose(pose, basis.value, targetHeading);
  if (!facing) {
    return;
  }
  // oxlint-disable-next-line no-unsafe-type-assertion -- camera_options holds every vtk.js camera field (getCameraOptions)
  const options = hybridViewerStore.camera_options as unknown as CameraOptions;
  // Animates the camera then syncs the remote one, which renders the viewer image
  hybridViewerStore.setCamera({
    ...options,
    focal_point: [...facing.focal_point],
    position: [...facing.position],
    view_up: [...facing.view_up],
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
    @click="face(NORTH)"
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
      <!-- The letters are targets of their own: the click does not reach the button (north) -->
      <g
        v-for="letter in letters"
        :key="letter.label"
        class="letter-target"
        :data-testid="`orientationCompass-${letter.label}`"
        @click.stop="face(letter.angle)"
      >
        <title>Face {{ letter.name }}</title>
        <circle class="letter-hit" :cx="letter.x" :cy="letter.y" :r="LETTER_HIT_RADIUS" />
        <text class="letter" :class="{ north: letter.angle === NORTH }" :x="letter.x" :y="letter.y">
          {{ letter.label }}
        </text>
      </g>
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

.letter-hit {
  fill: transparent;
  transition: fill 0.2s ease;
}

.letter-target:hover .letter-hit {
  fill: rgba(var(--v-theme-on-surface), 0.14);
}

.letter {
  fill: rgb(var(--v-theme-on-surface));
  font-family: var(--v-font-body, inherit);
  font-size: 11px;
  font-weight: 500;
  text-anchor: middle;
  dominant-baseline: central;
  pointer-events: none;
  user-select: none;
}

.letter.north {
  fill: #f48830;
  font-weight: 600;
}
</style>
