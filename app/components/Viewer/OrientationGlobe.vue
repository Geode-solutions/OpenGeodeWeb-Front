<script setup lang="ts">
import {
  type GlobeLabel,
  cameraElevation,
  globeLabels,
  northPoint,
  orientationReadout,
  strataRings,
} from "@ogw_front/utils/orientation_globe";
import { cameraViewBasis, toCameraPose } from "@ogw_front/utils/orientation_gizmo";
import { compassHeading } from "@ogw_front/utils/orientation_compass";
import { strataPixels } from "@ogw_front/utils/orientation_strata";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

// Orientation globe: a sphere crossed by horizontal strata (the "round shape & lines" of the Geode
// Solutions brand, and the geometry of its mark), the world axes from its center and the north as the
// Brand orange dot. The strata stay horizontal in the world, so up and the tilt read at a glance.
// A click on an axis label looks from that axis; a click on the globe itself does nothing.

const SIZE = 112;
const HALF_SIZE = SIZE / 2;
const RADIUS = 30;
const BACKDROP_MARGIN = 14;
const BACKDROP_RADIUS = RADIUS + BACKDROP_MARGIN;
// Axes stay crisp while roughly in the screen plane, then fade down to AWAY_OPACITY pointing away
const FADE_START_DEPTH = -0.3;
const FADE_RANGE = 0.7;
const AWAY_OPACITY = 0.45;
// Light stratum color: Bleu Fumée tint, on the viewer background
const STRATA_COLOR = "#E8EEF0";
const AXIS_COLORS = { x: "#D9553B", y: "#3F8F63", z: "#3567B5" } as const;
const INK = "#1F2E33";
const ORANGE = "#F48830";

const hybridViewerStore = useHybridViewerStore();
// The strata are drawn off the DOM and shown as an SVG image: the viewer keeps a single <canvas>, the
// VTK one, which the viewer tests locate
let strataCanvas: HTMLCanvasElement | undefined = undefined;
const strataImage = ref("");

const basis = computed(() => {
  const pose = toCameraPose(hybridViewerStore.camera_options);
  return pose && cameraViewBasis(pose);
});

const rings = computed(() => {
  if (!basis.value) {
    return [];
  }
  return strataRings(basis.value, RADIUS);
});
const labels = computed(() => {
  if (!basis.value) {
    return [];
  }
  return globeLabels(basis.value, RADIUS);
});
const north = computed(() => {
  if (!basis.value) {
    return undefined;
  }
  return northPoint(basis.value, RADIUS);
});

// The last readable heading is kept while the camera is rolled until no heading can be read
const heading = ref(0);
watch(
  basis,
  (value) => {
    heading.value = (value && compassHeading(value)) ?? heading.value;
  },
  { immediate: true },
);
const readout = computed(() => {
  if (!basis.value) {
    return "";
  }
  return orientationReadout(heading.value, cameraElevation(basis.value));
});

function axisColor(label: GlobeLabel): string {
  return AXIS_COLORS[label.axis];
}

function opacity(depth: number): number {
  const fade = Math.min(1, Math.max(0, (FADE_START_DEPTH - depth) / FADE_RANGE));
  return 1 - (1 - AWAY_OPACITY) * fade;
}

function lookFrom(label: GlobeLabel): void {
  // Animates the camera then syncs the remote one, which renders the viewer image
  hybridViewerStore.setCameraOrientation(label.key);
}

function drawStrata(): void {
  strataCanvas ??= document.createElement("canvas");
  const canvas = strataCanvas;
  const context = canvas.getContext("2d");
  if (!context || !basis.value) {
    return;
  }
  const side = Math.ceil(2 * RADIUS * (globalThis.devicePixelRatio || 1));
  canvas.width = side;
  canvas.height = side;
  const image = context.createImageData(side, side);
  image.data.set(strataPixels(basis.value, side, STRATA_COLOR));
  context.putImageData(image, 0, 0);
  strataImage.value = canvas.toDataURL();
}

watch(basis, drawStrata, { immediate: true });
</script>

<template>
  <div class="orientation-globe" data-testid="orientationGlobe">
    <div class="globe-stage">
      <svg
        :width="SIZE"
        :height="SIZE"
        :viewBox="`${-HALF_SIZE} ${-HALF_SIZE} ${SIZE} ${SIZE}`"
        shape-rendering="geometricPrecision"
        role="group"
        aria-label="Orientation axes"
      >
        <image
          v-if="strataImage"
          class="globe-strata"
          :href="strataImage"
          :x="-RADIUS"
          :y="-RADIUS"
          :width="2 * RADIUS"
          :height="2 * RADIUS"
          aria-hidden="true"
        />
        <circle class="backdrop" :r="BACKDROP_RADIUS" />
        <!-- Catches the pointer so a click on the globe neither moves the camera nor reaches the viewer -->
        <g class="globe-body" data-testid="orientationGlobe-body">
          <circle class="sphere" :r="RADIUS" />
          <path
            v-for="(ring, index) in rings"
            :key="`back-${index}`"
            class="ring-back"
            :class="{ equator: ring.equator }"
            :d="ring.back"
          />
          <path
            v-for="(ring, index) in rings"
            :key="`front-${index}`"
            class="ring-front"
            :class="{ equator: ring.equator }"
            :d="ring.front"
          />
        </g>
        <line
          v-for="label in labels"
          :key="`line-${label.key}`"
          class="axis-line"
          :x2="label.tipX"
          :y2="label.tipY"
          :stroke="axisColor(label)"
          :opacity="opacity(label.depth)"
        />
        <circle class="center" r="2" />
        <circle
          v-if="north"
          class="north"
          :class="{ away: north.depth < 0 }"
          :cx="north.x"
          :cy="north.y"
          :r="north.depth < 0 ? 2.6 : 3.6"
        />
        <text
          v-for="label in labels"
          :key="`label-${label.key}`"
          class="axis-label"
          :class="{ foreshortened: label.foreshortened }"
          :x="label.x"
          :y="label.y"
          :fill="axisColor(label)"
          :opacity="opacity(label.depth)"
          role="button"
          tabindex="0"
          :data-testid="`orientationGlobe-${label.key}`"
          :aria-label="`View from +${label.text}`"
          @click="lookFrom(label)"
          @keydown.enter.prevent="lookFrom(label)"
          @keydown.space.prevent="lookFrom(label)"
        >
          {{ label.text }}
          <title>View from +{{ label.text }}</title>
        </text>
      </svg>
    </div>
    <div class="readout" data-testid="orientationGlobeReadout">{{ readout }}</div>
  </div>
</template>

<style scoped>
/* The readout hangs under the stage, so the globe stays centered like the compass */
.orientation-globe {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--v-font-heading, inherit);
  color: v-bind(INK);
}

.globe-stage {
  position: relative;
  width: 112px;
  height: 112px;
}

.globe-strata {
  pointer-events: none;
}

svg {
  position: relative;
  overflow: visible;
}

.backdrop {
  fill: rgba(232, 238, 240, 0.55);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.orientation-globe:hover .backdrop,
.orientation-globe:focus-within .backdrop {
  opacity: 1;
}

.globe-body {
  pointer-events: all;
}

.sphere {
  fill: rgba(232, 238, 240, 0.18);
  stroke: rgba(31, 46, 51, 0.6);
  stroke-width: 1.25px;
}

.ring-back {
  fill: none;
  stroke: rgba(31, 46, 51, 0.14);
  stroke-width: 1px;
}

.ring-back.equator {
  stroke: rgba(31, 46, 51, 0.22);
}

.ring-front {
  fill: none;
  stroke: rgba(31, 46, 51, 0.38);
  stroke-width: 1px;
  stroke-linecap: round;
}

.ring-front.equator {
  stroke: rgba(31, 46, 51, 0.7);
  stroke-width: 1.4px;
}

.axis-line {
  stroke-width: 1.75px;
  stroke-linecap: round;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.center {
  fill: v-bind(INK);
  pointer-events: none;
}

.north {
  fill: v-bind(ORANGE);
  stroke: #e8eef0;
  stroke-width: 1.5px;
  pointer-events: none;
}

.north.away {
  fill-opacity: 0.5;
  stroke-width: 0;
}

.axis-label {
  font-size: 12px;
  font-weight: 700;
  text-anchor: middle;
  dominant-baseline: central;
  cursor: pointer;
  outline: none;
  pointer-events: all;
  user-select: none;
  transition: opacity 0.2s ease;
}

.axis-label.foreshortened {
  font-size: 10px;
}

.axis-label:hover,
.axis-label:focus-visible {
  text-decoration: underline;
  text-underline-offset: 2px;
}

.readout {
  position: absolute;
  top: calc(100% - 6px);
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--v-font-body, inherit);
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.orientation-globe:hover .readout,
.orientation-globe:focus-within .readout {
  opacity: 0.9;
}
</style>
