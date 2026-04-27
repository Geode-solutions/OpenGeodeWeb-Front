<script setup>
import GlassCard from "@ogw_front/components/GlassCard";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const ANGLE_OFFSET = 180;

const { panel, width } = defineProps({
  panel: { type: Boolean, default: false },
  width: { type: Number, default: 400 },
});

const emit = defineEmits(["close", "select"]);

const orientations = [
  {
    label: "Top",
    value: "Top",
    face: "top",
    rotation: "rotateX(-90deg)",
    position: { top: "15%", left: "50%" },
  },
  {
    label: "Bottom",
    value: "Bottom",
    face: "bottom",
    rotation: "rotateX(90deg)",
    position: { top: "85%", left: "50%" },
  },
  {
    label: "North",
    value: "North",
    face: "front",
    rotation: "rotateX(0deg) rotateY(0deg)",
    position: { top: "35%", left: "20%" },
  },
  {
    label: "South",
    value: "South",
    face: "back",
    rotation: "rotateX(0deg) rotateY(180deg)",
    position: { top: "65%", left: "80%" },
  },
  {
    label: "East",
    value: "East",
    face: "right",
    rotation: "rotateX(0deg) rotateY(-90deg)",
    position: { top: "35%", left: "80%" },
  },
  {
    label: "West",
    value: "West",
    face: "left",
    rotation: "rotateX(0deg) rotateY(90deg)",
    position: { top: "65%", left: "20%" },
  },
];

const hoveredFace = ref();
const hybridViewerStore = useHybridViewerStore();

const currentCameraRotation = computed(() => {
  const { position, focal_point } = hybridViewerStore.camera_options;
  if (!position) {
    return "rotateX(-30deg) rotateY(45deg)";
  }
  const [deltaX, deltaY, deltaZ] = [
    position[0] - focal_point[0],
    position[1] - focal_point[1],
    position[2] - focal_point[2],
  ];
  const azimuth = -Math.atan2(deltaX, deltaY) * (ANGLE_OFFSET / Math.PI);
  const elevation = Math.atan2(deltaZ, Math.hypot(deltaX, deltaY)) * (ANGLE_OFFSET / Math.PI);
  return `rotateX(${elevation}deg) rotateY(${azimuth}deg)`;
});

const cubeTransform = computed(
  () =>
    orientations.find((orientation) => orientation.face === hoveredFace.value)?.rotation ||
    currentCameraRotation.value,
);
</script>

<template>
  <GlassCard
    v-if="panel"
    v-click-outside="() => emit('close')"
    @click.stop
    title="Camera Orientations"
    :width="width"
    variant="panel"
    class="position-absolute rounded-xl pa-0 elevation-24"
    style="z-index: 2; top: 90px; right: 55px"
  >
    <v-card-text
      class="pa-0 overflow-hidden position-relative"
      style="
        height: 320px;
        background: radial-gradient(circle at center, rgba(255, 255, 255, 0.05), transparent 70%);
      "
    >
      <svg class="position-absolute fill-height w-100" style="pointer-events: none">
        <line
          v-for="orientation in orientations"
          :key="orientation.value"
          x1="50%"
          y1="50%"
          :x2="orientation.position.left"
          :y2="orientation.position.top"
          :stroke="hoveredFace === orientation.face ? 'white' : 'rgba(255,255,255,0.1)'"
          :stroke-width="hoveredFace === orientation.face ? 2 : 1"
          class="transition-all"
          style="filter: drop-shadow(0 0 3px white)"
        />
      </svg>

      <div
        class="position-absolute d-flex align-center justify-center"
        style="top: 50%; left: 50%; transform: translate(-50%, -50%)"
      >
        <div class="cube-container" style="--size: 50px; --z: 25px">
          <div class="cube" :style="{ transform: cubeTransform }">
            <div
              v-for="orientation in orientations"
              :key="orientation.value"
              :class="['cube-face', orientation.face, { active: hoveredFace === orientation.face }]"
            >
              <span class="font-weight-black" style="font-size: 12px">{{ orientation.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <v-btn
        v-for="orientation in orientations"
        :key="orientation.value"
        icon
        variant="tonal"
        size="44"
        class="satellite-node position-absolute"
        :style="orientation.position"
        @mouseenter="hoveredFace = orientation.face"
        @mouseleave="hoveredFace = undefined"
        @click.stop="emit('select', orientation.value)"
      >
        <v-tooltip activator="parent" location="top">{{ orientation.value }} View</v-tooltip>
        <span class="text-caption font-weight-black">{{ orientation.label }}</span>
      </v-btn>
    </v-card-text>
    <template #actions>
      <v-card-actions class="justify-center pb-6">
        <v-btn variant="text" size="small" @click="emit('close')">Close</v-btn>
      </v-card-actions>
    </template>
  </GlassCard>

  <v-list v-else density="compact" class="pa-4 orientation-menu rounded-lg" elevation="8">
    <div class="d-flex flex-column align-center" style="gap: 16px">
      <div class="cube-container" style="--size: 30px; --z: 15px">
        <div class="cube" :style="{ transform: cubeTransform }">
          <div
            v-for="orientation in orientations"
            :key="orientation.value"
            :class="['cube-face', orientation.face, { active: hoveredFace === orientation.face }]"
          >
            <span class="font-weight-black" style="font-size: 5px; letter-spacing: 0px">{{
              orientation.label
            }}</span>
          </div>
        </div>
      </div>
      <v-divider class="w-100" />
      <div class="d-flex flex-wrap justify-center" style="max-width: 140px">
        <v-btn
          v-for="orientation in orientations"
          :key="orientation.value"
          icon
          size="32"
          variant="text"
          class="ma-1"
          @mouseenter="hoveredFace = orientation.face"
          @mouseleave="hoveredFace = undefined"
          @click.stop="emit('select', orientation.value)"
        >
          <v-tooltip activator="parent" location="top">{{ orientation.label }}</v-tooltip>
          <span class="text-caption font-weight-black">{{ orientation.label }}</span>
        </v-btn>
      </div>
    </div>
  </v-list>
</template>

<style scoped>
.cube-container {
  width: var(--size);
  height: var(--size);
  perspective: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cube {
  width: var(--size);
  height: var(--size);
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
}
.cube-face {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(60, 60, 60, 1);
  backdrop-filter: blur(2px);
  transition: all 0.3s ease;
  color: white;
}
.cube-face.active {
  background: white;
  color: black;
  border-color: white;
}
.satellite-node {
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.2) !important;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  transition: all 0.2s ease;
}
.satellite-node:hover {
  transform: translate(-50%, -50%) scale(1.1);
  border-color: white !important;
  background: rgba(255, 255, 255, 0.1) !important;
}
.front {
  transform: translateZ(var(--z));
}
.back {
  transform: rotateY(180deg) translateZ(var(--z));
}
.right {
  transform: rotateY(90deg) translateZ(var(--z));
}
.left {
  transform: rotateY(-90deg) translateZ(var(--z));
}
.top {
  transform: rotateX(90deg) translateZ(var(--z));
}
.bottom {
  transform: rotateX(-90deg) translateZ(var(--z));
}
.transition-all {
  transition: all 0.4s ease;
}
.orientation-menu {
  min-width: 180px;
  background: rgb(var(--v-theme-surface)) !important;
}
</style>
