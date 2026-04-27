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
  { label: "Top", value: "Top", face: "top", pos: { top: "15%", left: "50%" } },
  { label: "Bottom", value: "Bottom", face: "bottom", pos: { top: "85%", left: "50%" } },
  { label: "North", value: "North", face: "front", pos: { top: "35%", left: "20%" } },
  { label: "South", value: "South", face: "back", pos: { top: "65%", left: "80%" } },
  { label: "East", value: "East", face: "right", pos: { top: "35%", left: "80%" } },
  { label: "West", value: "West", face: "left", pos: { top: "65%", left: "20%" } },
];

const hoveredFace = ref(undefined);

const hybridViewerStore = useHybridViewerStore();

const currentCameraRotation = computed(() => {
  const { position, focal_point } = hybridViewerStore.camera_options;
  if (!position || !focal_point) {
    return "rotateX(-30deg) rotateY(45deg)";
  }

  const diffX = position[0] - focal_point[0];
  const diffY = position[1] - focal_point[1];
  const diffZ = position[2] - focal_point[2];

  const azimuth = Math.atan2(-diffX, diffY) * (ANGLE_OFFSET / Math.PI);
  const distance = Math.hypot(diffX, diffY);
  const elevation = -Math.atan2(diffZ, distance) * (ANGLE_OFFSET / Math.PI);

  return `rotateX(${elevation}deg) rotateY(${azimuth}deg)`;
});

const rotationMap = {
  top: "rotateX(-90deg)",
  bottom: "rotateX(90deg)",
  front: "rotateX(0deg)",
  back: "rotateX(0deg) rotateY(180deg)",
  right: "rotateX(0deg) rotateY(-90deg)",
  left: "rotateX(0deg) rotateY(90deg)",
};

const cubeTransform = computed(() => rotationMap[hoveredFace.value] || currentCameraRotation.value);
</script>

<template>
  <GlassCard
    v-if="panel"
    v-click-outside="() => emit('close')"
    @click.stop
    title="Camera Orientations"
    :width="width"
    variant="panel"
    padding="pa-0"
    class="position-absolute rounded-xl elevation-24"
    style="z-index: 2; top: 90px; right: 55px"
  >
    <v-card-text class="pa-0">
      <div class="camera-orientations-wrapper">
        <svg class="camera-orientations-lines">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" />
              <feComposite in="SourceGraphic" operator="over" />
            </filter>
          </defs>
          <line
            v-for="orientation in orientations"
            :key="orientation.value"
            x1="50%"
            y1="50%"
            :x2="orientation.pos.left"
            :y2="orientation.pos.top"
            :stroke="hoveredFace === orientation.face ? 'white' : 'rgba(255,255,255,0.1)'"
            :stroke-width="hoveredFace === orientation.face ? 2 : 1"
            class="transition-all"
            style="filter: url(#glow)"
          />
        </svg>

        <div class="camera-orientations-center">
          <div class="cube-container">
            <div class="cube" :style="{ transform: cubeTransform }">
              <div
                v-for="orientation in orientations"
                :key="orientation.value"
                :class="[
                  'cube-face',
                  orientation.face,
                  { active: hoveredFace === orientation.face },
                ]"
              >
                <span class="face-label">{{ orientation.label }}</span>
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
          :style="orientation.pos"
          @mouseenter="hoveredFace = orientation.face"
          @mouseleave="hoveredFace = undefined"
          @click.stop="emit('select', orientation.value)"
        >
          <v-tooltip activator="parent" location="top" offset="10">
            {{ orientation.value }} View
          </v-tooltip>
          <span class="text-caption font-weight-black">{{ orientation.label }}</span>
        </v-btn>
      </div>
    </v-card-text>

    <template #actions>
      <v-card-actions class="justify-center pb-6">
        <v-btn variant="text" color="white" size="small" @click="emit('close')"> Close </v-btn>
      </v-card-actions>
    </template>
  </GlassCard>

  <v-list v-else density="compact" class="pa-2 orientation-menu" elevation="8" rounded="lg">
    <div class="pa-2 d-flex flex-column align-center" style="gap: 12px">
      <div class="cube-container mini">
        <div class="cube" :style="{ transform: cubeTransform }">
          <div
            v-for="opt in orientations"
            :key="opt.value"
            :class="['cube-face', opt.face, { active: hoveredFace === opt.face }]"
          >
            <span class="face-label mini">{{ opt.label }}</span>
          </div>
        </div>
      </div>
      <v-divider class="w-100" />
      <div class="d-flex flex-wrap justify-center" style="max-width: 150px">
        <v-btn
          v-for="opt in orientations"
          :key="opt.value"
          icon
          size="36"
          variant="text"
          class="ma-1"
          @mouseenter="hoveredFace = opt.face"
          @mouseleave="hoveredFace = undefined"
          @click.stop="emit('select', opt.value)"
        >
          <v-tooltip activator="parent" location="top">{{ opt.label }}</v-tooltip>
          <span class="text-caption font-weight-bold">
            {{ opt.label }}
          </span>
        </v-btn>
      </div>
    </div>
  </v-list>
</template>

<style scoped>
.camera-orientations-wrapper {
  position: relative;
  width: 100%;
  height: 320px;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
  overflow: hidden;
}

.camera-orientations-lines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.camera-orientations-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
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

.cube-container {
  width: 80px;
  height: 80px;
  perspective: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.cube-container.mini {
  width: 50px;
  height: 50px;
}

.cube {
  width: 50px;
  height: 50px;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.cube-container.mini .cube {
  width: 30px;
  height: 30px;
}

.cube-face {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(2px);
  transition: all 0.3s ease;
  color: white;
}

.cube-face.active {
  background: rgba(255, 255, 255, 0.95);
  color: black;
  backdrop-filter: blur(12px);
  border-color: white;
}

.face-label {
  font-weight: 900;
  font-size: 11px;
  letter-spacing: 1px;
}

.face-label.mini {
  font-size: 7px;
}

.front {
  transform: translateZ(25px);
}
.back {
  transform: rotateY(180deg) translateZ(25px);
}
.right {
  transform: rotateY(90deg) translateZ(25px);
}
.left {
  transform: rotateY(-90deg) translateZ(25px);
}
.top {
  transform: rotateX(90deg) translateZ(25px);
}
.bottom {
  transform: rotateX(-90deg) translateZ(25px);
}

.mini .front {
  transform: translateZ(15px);
}
.mini .back {
  transform: rotateY(180deg) translateZ(15px);
}
.mini .right {
  transform: rotateY(90deg) translateZ(15px);
}
.mini .left {
  transform: rotateY(-90deg) translateZ(15px);
}
.mini .top {
  transform: rotateX(90deg) translateZ(15px);
}
.mini .bottom {
  transform: rotateX(-90deg) translateZ(15px);
}

.transition-all {
  transition: all 0.4s ease;
}
.orientation-menu {
  min-width: 180px;
  background-color: rgb(var(--v-theme-surface)) !important;
}
</style>
