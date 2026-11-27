<script setup lang="ts">
import { type CameraOrientation, isNorth } from "@ogw_front/utils/camera_orientations";
import { compassDialPoint } from "@ogw_front/utils/orientation_compass";
import { useCompassDial } from "@ogw_front/composables/compass_dial";

// Compass layout of the orientation panel, in the look of the scene compass (Viewer/OrientationCompass.vue):
// The cardinal buttons sit on a dial turned with the camera heading and flattened with its elevation,
// So each one stays on its side of the cube drawn in the middle (slot). Up and down sit apart.

interface Props {
  orientations: CameraOrientation[];
}

const { orientations } = defineProps<Props>();

interface Emits {
  select: [value: string];
}

const emit = defineEmits<Emits>();

const hoveredFace = defineModel<string | undefined>("hoveredFace");

const BUTTON_RADIUS = 82;
const TICK_OUTER_RADIUS = 62;
const TICK_INNER_RADIUS = 57;
const CARDINAL_TICK_INNER_RADIUS = 51;
const TICK_STEP = 30;
const QUARTER_TURN = 90;
const FULL_TURN = 360;
const TICK_ANGLES = Array.from(
  { length: FULL_TURN / TICK_STEP },
  (_item, index) => index * TICK_STEP,
);
// Up and down, in pixels from the panel center
const VERTICAL_X = 98;
const VERTICAL_Y = 80;

const { heading, tilt } = useCompassDial();

const dialTransform = computed(() => `scale(1 ${tilt.value}) rotate(${-heading.value})`);

interface PlacedOrientation {
  orientation: CameraOrientation;
  x: number;
  y: number;
}

const placed = computed<PlacedOrientation[]>(() =>
  orientations.map((orientation) => {
    if (orientation.heading === undefined) {
      const isUp = orientation.value === "zplus";
      return { orientation, x: VERTICAL_X, y: isUp ? -VERTICAL_Y : VERTICAL_Y };
    }
    const { x, y } = compassDialPoint(
      orientation.heading,
      BUTTON_RADIUS,
      heading.value,
      tilt.value,
    );
    return { orientation, x, y };
  }),
);

const hoveredHeading = computed(
  () => orientations.find((orientation) => orientation.face === hoveredFace.value)?.heading,
);

function tickInnerRadius(angle: number): number {
  return angle % QUARTER_TURN === 0 ? CARDINAL_TICK_INNER_RADIUS : TICK_INNER_RADIUS;
}

function nodeStyle({ x, y }: PlacedOrientation): Record<string, string> {
  return { top: `calc(50% + ${y}px)`, left: `calc(50% + ${x}px)` };
}
</script>

<template>
  <div class="compass-dial position-relative" data-testid="cameraOrientationDial">
    <svg class="position-absolute w-100 h-100" aria-hidden="true">
      <svg x="50%" y="50%" overflow="visible">
        <g :transform="dialTransform">
          <ellipse class="ring" :rx="TICK_OUTER_RADIUS" :ry="TICK_OUTER_RADIUS" />
          <line
            v-for="angle in TICK_ANGLES"
            :key="angle"
            class="tick"
            :class="{ north: angle === 0, hovered: angle === hoveredHeading }"
            :y1="-tickInnerRadius(angle)"
            :y2="-TICK_OUTER_RADIUS"
            :transform="`rotate(${angle})`"
          />
        </g>
      </svg>
    </svg>

    <div class="cube position-absolute">
      <slot />
    </div>

    <v-btn
      v-for="item in placed"
      :key="item.orientation.value"
      icon
      variant="text"
      size="32"
      class="compass-node position-absolute"
      :class="{
        north: isNorth(item.orientation),
        vertical: item.orientation.heading === undefined,
      }"
      :style="nodeStyle(item)"
      :data-testid="`cameraOrientation${item.orientation.vtkKey}Button`"
      @mouseenter="hoveredFace = item.orientation.face"
      @mouseleave="hoveredFace = undefined"
      @click.stop="emit('select', item.orientation.value)"
    >
      <v-tooltip activator="parent" location="top">{{ item.orientation.tooltip }}</v-tooltip>
      <span class="compass-letter">{{ item.orientation.label }}</span>
    </v-btn>
  </div>
</template>

<style scoped>
.compass-dial {
  height: 220px;
}

.cube {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.ring {
  fill: rgba(var(--v-theme-surface), 0.72);
  stroke: rgba(var(--v-border-color), var(--v-border-opacity));
  stroke-width: 1px;
  vector-effect: non-scaling-stroke;
}

.tick {
  stroke: rgba(var(--v-theme-on-surface), 0.35);
  stroke-width: 1px;
  vector-effect: non-scaling-stroke;
  transition: stroke 0.2s ease;
}

.tick.north {
  stroke: #f48830;
}

.tick.hovered {
  stroke: rgb(var(--v-theme-on-surface));
  stroke-width: 2px;
}

.tick.north.hovered {
  stroke: #f48830;
}

/* Round targets of the scene compass: translucent surface, thin border, brighter on hover */
.compass-node {
  transform: translate(-50%, -50%);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgba(var(--v-theme-surface), 0.72) !important;
  backdrop-filter: blur(6px);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.compass-node:hover,
.compass-node:focus-visible {
  border-color: rgba(var(--v-theme-on-surface), 0.35);
  background: rgba(var(--v-theme-surface), 0.86) !important;
}

.compass-node.north,
.compass-node.north:hover {
  border-color: rgba(244, 136, 48, 0.6);
}

.compass-letter {
  color: rgb(var(--v-theme-on-surface));
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
}

.compass-node.north .compass-letter {
  color: #f48830;
  font-weight: 600;
}

.compass-node.vertical .compass-letter {
  font-size: 10px;
}
</style>
