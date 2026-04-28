<script setup>
import GlassCard from "@ogw_front/components/GlassCard";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { newInstance as vtkAnnotatedCubeActor } from "@kitware/vtk.js/Rendering/Core/AnnotatedCubeActor";
import { newInstance as vtkGenericRenderWindow } from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";

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
    position: { top: "15%", left: "50%" },
  },
  {
    label: "Bottom",
    value: "Bottom",
    face: "bottom",
    position: { top: "85%", left: "50%" },
  },
  {
    label: "North",
    value: "North",
    face: "front",
    position: { top: "35%", left: "20%" },
  },
  {
    label: "South",
    value: "South",
    face: "back",
    position: { top: "65%", left: "80%" },
  },
  {
    label: "East",
    value: "East",
    face: "right",
    position: { top: "35%", left: "80%" },
  },
  {
    label: "West",
    value: "West",
    face: "left",
    position: { top: "65%", left: "20%" },
  },
];

const hoveredFace = ref();
const hybridViewerStore = useHybridViewerStore();
const cubeContainer = useTemplateRef("cubeContainer");

let genericRenderWindow = undefined;
let cubeActor = undefined;

function initVTK() {
  if (genericRenderWindow) {
    return;
  }
  genericRenderWindow = vtkGenericRenderWindow({
    background: [0, 0, 0, 0],
    listenWindowResize: false,
  });

  cubeActor = vtkAnnotatedCubeActor();
  cubeActor.setDefaultStyle({
    fontFamily: "sans-serif",
    fontStyle: "bold",
    faceColor: "rgba(60, 60, 60, 1)",
    fontColor: "white",
    edgeColor: "rgba(255, 255, 255, 0.4)",
    edgeThickness: 0.1,
    resolution: 400,
    fontSizeScale: (resolution) => resolution / 4,
  });

  // Mapping VTK axes to labels with rotation for upright text
  cubeActor.setXPlusFaceProperty({ text: "East", faceRotation: 90 });
  cubeActor.setXMinusFaceProperty({ text: "West", faceRotation: -90 });
  cubeActor.setYPlusFaceProperty({ text: "North", faceRotation: 180 });
  cubeActor.setYMinusFaceProperty({ text: "South", faceRotation: 0 });
  cubeActor.setZPlusFaceProperty({ text: "Top", faceRotation: 0 });
  cubeActor.setZMinusFaceProperty({ text: "Bottom", faceRotation: 0 });

  cubeActor.getProperty().setBackfaceCulling(true);

  const renderer = genericRenderWindow.getRenderer();
  renderer.addActor(cubeActor);
  renderer.resetCamera();
}

watch(cubeContainer, (newContainer) => {
  if (newContainer && import.meta.client) {
    initVTK();
    genericRenderWindow.setContainer(newContainer);
    const canvas = genericRenderWindow.getApiSpecificRenderWindow().getCanvas();
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.background = "transparent";
    genericRenderWindow.resize();
  }
});

onMounted(() => {
  if (cubeContainer.value && import.meta.client) {
    initVTK();
    genericRenderWindow.setContainer(cubeContainer.value);
  }
});

onBeforeUnmount(() => {
  if (genericRenderWindow) {
    genericRenderWindow.delete();
  }
});

// Sync local cube camera with main store camera
watch(
  () => hybridViewerStore.camera_options,
  (options) => {
    if (!genericRenderWindow || !options.position) {
      return;
    }
    const renderer = genericRenderWindow.getRenderer();
    const camera = renderer.getActiveCamera();

    camera.setPosition(...options.position);
    camera.setFocalPoint(...options.focal_point);
    camera.setViewUp(...options.view_up);
    renderer.resetCamera();

    genericRenderWindow.getRenderWindow().render();
  },
  { deep: true },
);

const faceMapping = {
  right: "XPlus",
  left: "XMinus",
  front: "YPlus",
  back: "YMinus",
  top: "ZPlus",
  bottom: "ZMinus",
};

watch(hoveredFace, (newFace, oldFace) => {
  if (!cubeActor) {
    return;
  }
  if (oldFace && faceMapping[oldFace]) {
    cubeActor[`set${faceMapping[oldFace]}FaceProperty`]({
      faceColor: "rgba(60, 60, 60, 1)",
      fontColor: "white",
    });
  }

  if (newFace && faceMapping[newFace]) {
    cubeActor[`set${faceMapping[newFace]}FaceProperty`]({
      faceColor: "rgba(255, 255, 255, 0.95)",
      fontColor: "black",
    });
  }

  if (genericRenderWindow) {
    genericRenderWindow.getRenderWindow().render();
  }
});
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
        <div ref="cubeContainer" style="width: 100px; height: 100px" />
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
      <div
        class="d-flex align-center justify-center"
        style="width: 60px; height: 60px; border-radius: 8px; overflow: hidden"
      >
        <div ref="cubeContainer" class="w-100 h-100" />
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
.transition-all {
  transition: all 0.4s ease;
}
.orientation-menu {
  min-width: 180px;
  background: rgb(var(--v-theme-surface)) !important;
}
</style>
