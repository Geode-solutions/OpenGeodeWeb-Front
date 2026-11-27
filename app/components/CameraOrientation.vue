<script setup lang="ts">
import {
  type CameraOrientation,
  cameraOrientations,
  isNorth,
} from "@ogw_front/utils/camera_orientations";
import type { CssColor, Pixels } from "@ogw_front/types/ui";
import { BRAND_ORANGE } from "@ogw_front/utils/brand_colors";
import type { CameraOptions } from "@ogw_internal/stores/hybrid_viewer/vtk_types.js";
import CameraOrientationDial from "@ogw_front/components/CameraOrientationDial.vue";
import type { CameraOrientationKey } from "@ogw_internal/stores/hybrid_viewer/camera_helpers";
import ToolPanel from "@ogw_front/components/ToolPanel.vue";
import { applyCameraOptions } from "@ogw_internal/stores/hybrid_viewer/camera";
import { orientationCubeStyle } from "@ogw_front/utils/orientation_cube_style";
import { useChromeTheme } from "@ogw_front/composables/chrome_theme";
import { useDataStyleStore } from "@ogw_front/stores/data_style";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { useTheme } from "vuetify";
import { newInstance as vtkAnnotatedCubeActor } from "@kitware/vtk.js/Rendering/Core/AnnotatedCubeActor";
import { newInstance as vtkGenericRenderWindow } from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";

interface Props {
  panel: boolean;
  width?: Pixels;
  escapeFunction?: () => void;
}

interface Emits {
  select: [value: CameraOrientationKey];
}

const DEFAULT_PANEL_WIDTH = 260;

const { panel, width = DEFAULT_PANEL_WIDTH, escapeFunction = undefined } = defineProps<Props>();

const emit = defineEmits<Emits>();

const show = defineModel<boolean>("show", { default: false });

// With the compass marker, the orientations read north, east, south, west, up and down
const dataStyleStore = useDataStyleStore();
const isCompass = computed(() => dataStyleStore.sceneStyle.orientation_widget === "compass");
const orientations = computed(() =>
  cameraOrientations(dataStyleStore.sceneStyle.orientation_widget),
);

// The cube follows the theme it is shown in: the chrome theme of the panel (GlassCard), the app
// Theme for the menu
const theme = useTheme();
const chromeTheme = useChromeTheme();
const cubeStyle = computed(() => {
  const name = panel ? chromeTheme.value : theme.global.name.value;
  const colors = theme.computedThemes.value[name]?.colors;
  return orientationCubeStyle({ surface: colors?.surface, "on-surface": colors?.["on-surface"] });
});

const hoveredFace = ref<string | undefined>(undefined);
const hybridViewerStore = useHybridViewerStore();
const cubeContainer = useTemplateRef("cubeContainer");

let genericRenderWindow: unknown = undefined;
let cubeActor: unknown = undefined;
let isInteracting = false;

function faceStyle(
  orientation: CameraOrientation,
  hovered: boolean,
): { faceColor: CssColor; fontColor: CssColor } {
  const style = cubeStyle.value;
  if (hovered) {
    return { faceColor: style.hoveredFaceColor, fontColor: style.hoveredFontColor };
  }
  return {
    faceColor: style.faceColor,
    fontColor: isNorth(orientation) ? BRAND_ORANGE : style.fontColor,
  };
}

function labelFaces(): void {
  for (const orientation of orientations.value) {
    cubeActor[`set${orientation.vtkKey}FaceProperty`]({
      text: orientation.label,
      faceRotation: orientation.rotation,
      ...faceStyle(orientation, orientation.face === hoveredFace.value),
    });
  }
}

function edgeStyle(): { edgeColor: CssColor } {
  return { edgeColor: cubeStyle.value.edgeColor };
}

watch([orientations, cubeStyle], () => {
  if (!cubeActor) {
    return;
  }
  cubeActor.setDefaultStyle(edgeStyle());
  labelFaces();
  genericRenderWindow.getRenderWindow().render();
});

function initVTK(): void {
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
  });

  cubeActor = vtkAnnotatedCubeActor();
  cubeActor.setDefaultStyle({
    fontFamily: "sans-serif",
    fontStyle: "bold",
    ...edgeStyle(),
    edgeThickness: 0.1,
    resolution: 400,
    fontSizeScale: (resolution: number) => resolution / 4,
  });

  labelFaces();
  cubeActor.getProperty().setBackfaceCulling(true);

  const renderer = genericRenderWindow.getRenderer();

  renderer.addActor(cubeActor);
  renderer.resetCamera();
}

function syncCubeCamera(): void {
  const options = hybridViewerStore.camera_options;
  if (!genericRenderWindow || isInteracting || !options.position) {
    return;
  }
  const camera = genericRenderWindow.getRenderer().getActiveCamera();
  applyCameraOptions(camera, options as unknown as CameraOptions);
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
  function updateFace(face: string | undefined, active: boolean): void {
    const config = orientations.value.find((orientation) => orientation.face === face);
    if (config) {
      cubeActor[`set${config.vtkKey}FaceProperty`](faceStyle(config, active));
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
    :escapeFunction="escapeFunction"
  >
    <CameraOrientationDial
      v-if="isCompass"
      v-model:hoveredFace="hoveredFace"
      :orientations="orientations"
      @select="(value) => emit('select', value)"
    >
      <div ref="cubeContainer" style="width: 70px; height: 70px; pointer-events: none" />
    </CameraOrientationDial>
    <div
      v-else
      class="pa-0 overflow-hidden position-relative"
      style="
        height: 220px;
        background: radial-gradient(
          circle at center,
          rgba(var(--v-theme-on-surface), 0.05),
          transparent 70%
        );
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
          stroke="currentColor"
          :stroke-opacity="hoveredFace === orientation.face ? 1 : 0.1"
          :stroke-width="hoveredFace === orientation.face ? 2 : 1"
          class="transition-all"
          style="filter: drop-shadow(0 0 3px currentColor)"
        />
      </svg>

      <div
        class="position-absolute d-flex align-center justify-center"
        style="top: 50%; left: 50%; transform: translate(-50%, -50%)"
      >
        <div ref="cubeContainer" style="width: 70px; height: 70px; pointer-events: none" />
      </div>

      <v-btn
        v-for="orientation in orientations"
        :key="orientation.value"
        icon
        variant="tonal"
        size="32"
        class="satellite-node position-absolute"
        :style="orientation.position"
        :data-testid="`cameraOrientation${orientation.vtkKey}Button`"
        @mouseenter="hoveredFace = orientation.face"
        @mouseleave="hoveredFace = undefined"
        @click.stop="emit('select', orientation.value)"
      >
        <v-tooltip activator="parent" location="top">{{ orientation.tooltip }}</v-tooltip>
        <span class="text-caption font-weight-black" style="font-size: 0.7rem !important">{{
          orientation.label
        }}</span>
      </v-btn>
    </div>
  </ToolPanel>

  <v-list v-else density="compact" class="pa-4 orientation-menu rounded-lg" elevation="8">
    <div class="d-flex flex-column align-center" style="gap: 16px">
      <div
        class="d-flex align-center justify-center"
        style="width: 60px; height: 60px; border-radius: 8px; overflow: hidden"
      >
        <div ref="cubeContainer" class="w-100 h-100" style="pointer-events: none" />
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
          :data-testid="`cameraOrientation${orientation.vtkKey}Button`"
          @mouseenter="hoveredFace = orientation.face"
          @mouseleave="hoveredFace = undefined"
          @click.stop="emit('select', orientation.value)"
        >
          <v-tooltip activator="parent" location="top">{{ orientation.tooltip }}</v-tooltip>
          <span class="text-caption font-weight-black" :class="{ north: isNorth(orientation) }">{{
            orientation.label
          }}</span>
        </v-btn>
      </div>
    </div>
  </v-list>
</template>

<style scoped>
.satellite-node {
  transform: translate(-50%, -50%);
  background: rgba(var(--v-theme-background), 0.4) !important;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  transition: all 0.2s ease;
}
.satellite-node:hover {
  transform: translate(-50%, -50%) scale(1.1);
  border-color: rgb(var(--v-theme-primary)) !important;
  background: rgba(var(--v-theme-primary), 0.12) !important;
}
.transition-all {
  transition: all 0.4s ease;
}
.north {
  color: v-bind(BRAND_ORANGE);
}
.orientation-menu {
  min-width: 180px;
  background: rgb(var(--v-theme-surface)) !important;
}
</style>
