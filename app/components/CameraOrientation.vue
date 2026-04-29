<script setup>
import ToolPanel from "@ogw_front/components/ToolPanel";
import { setCameraState } from "@ogw_front/utils/vtk/camera";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { newInstance as vtkAnnotatedCubeActor } from "@kitware/vtk.js/Rendering/Core/AnnotatedCubeActor";
import { newInstance as vtkGenericRenderWindow } from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";

const { panel, width } = defineProps({
  panel: { type: Boolean, default: false },
  width: { type: Number, default: 400 },
});

const show = defineModel("show", { type: Boolean, default: false });
const emit = defineEmits(["select"]);

const orientations = [
  {
    label: "Z+",
    value: "zplus",
    face: "top",
    vtkKey: "ZPlus",
    rotation: 0,
    position: { top: "15%", left: "50%" },
  },
  {
    label: "Z-",
    value: "zminus",
    face: "bottom",
    vtkKey: "ZMinus",
    rotation: 0,
    position: { top: "85%", left: "50%" },
  },
  {
    label: "Y+",
    value: "yplus",
    face: "front",
    vtkKey: "YPlus",
    rotation: 180,
    position: { top: "35%", left: "20%" },
  },
  {
    label: "Y-",
    value: "yminus",
    face: "back",
    vtkKey: "YMinus",
    rotation: 0,
    position: { top: "65%", left: "80%" },
  },
  {
    label: "X+",
    value: "xplus",
    face: "right",
    vtkKey: "XPlus",
    rotation: 90,
    position: { top: "35%", left: "80%" },
  },
  {
    label: "X-",
    value: "xminus",
    face: "left",
    vtkKey: "XMinus",
    rotation: -90,
    position: { top: "65%", left: "20%" },
  },
];

const hoveredFace = ref(undefined);
const hybridViewerStore = useHybridViewerStore();
const cubeContainer = useTemplateRef("cubeContainer");

let genericRenderWindow = undefined;
let cubeActor = undefined;
let isInteracting = false;

function initVTK() {
  if (genericRenderWindow) {
    return;
  }
  genericRenderWindow = vtkGenericRenderWindow({
    background: [0, 0, 0, 0],
    listenWindowResize: false,
  });

  const interactor = genericRenderWindow.getInteractor();
  interactor.onStartAnimation(() => {
    isInteracting = true;
  });

  interactor.onEndAnimation(() => {
    isInteracting = false;
    hybridViewerStore.syncRemoteCamera();
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

  for (const orientation of orientations) {
    cubeActor[`set${orientation.vtkKey}FaceProperty`]({
      text: orientation.label,
      faceRotation: orientation.rotation,
    });
  }

  cubeActor.getProperty().setBackfaceCulling(true);

  const renderer = genericRenderWindow.getRenderer();
  const camera = renderer.getActiveCamera();

  camera.onModified(() => {
    if (isInteracting) {
      syncMainCamera();
    }
  });

  renderer.addActor(cubeActor);
  renderer.resetCamera();
}

function syncMainCamera() {
  const mainGRW = hybridViewerStore.genericRenderWindow.value;
  const mainCamera = mainGRW.getRenderer().getActiveCamera();
  const cubeCamera = genericRenderWindow.getRenderer().getActiveCamera();

  const dir = cubeCamera.getDirectionOfProjection();
  const dist = mainCamera.getDistance();
  const focal = mainCamera.getFocalPoint();

  mainCamera.set({
    position: focal.map((coord, i) => coord - dir[i] * dist),
    viewUp: cubeCamera.getViewUp(),
  });
  mainGRW.getRenderWindow().render();
}

function syncCubeCamera() {
  const options = hybridViewerStore.camera_options;
  if (isInteracting || !options.position) {
    return;
  }
  const camera = genericRenderWindow.getRenderer().getActiveCamera();
  setCameraState(camera, options);
  genericRenderWindow.getRenderer().resetCamera();
  genericRenderWindow.getRenderWindow().render();
}

watch(cubeContainer, (newContainer) => {
  if (!newContainer || !import.meta.client) {
    return;
  }
  initVTK();
  genericRenderWindow.setContainer(newContainer);
  const canvas = genericRenderWindow.getApiSpecificRenderWindow().getCanvas();
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.background = "transparent";
  genericRenderWindow.resize();
  syncCubeCamera();
});

onBeforeUnmount(() => genericRenderWindow?.delete());

watch(() => hybridViewerStore.camera_options, syncCubeCamera, { deep: true });

watch(hoveredFace, (newFace, oldFace) => {
  if (!cubeActor) {
    return;
  }
  function updateFace(face, active) {
    const config = orientations.find((orientation) => orientation.face === face);
    if (config) {
      cubeActor[`set${config.vtkKey}FaceProperty`]({
        faceColor: active ? "rgba(255, 255, 255, 0.95)" : "rgba(60, 60, 60, 1)",
        fontColor: active ? "black" : "white",
      });
    }
  }

  updateFace(oldFace, false);
  updateFace(newFace, true);
  genericRenderWindow.getRenderWindow().render();
});
</script>

<template>
  <ToolPanel
    v-if="panel"
    v-model="show"
    title="Camera Orientations"
    :width="width"
    style="z-index: 2; top: 90px; right: 55px"
  >
    <div
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
    </div>
  </ToolPanel>

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
