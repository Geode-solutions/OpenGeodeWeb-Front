<script setup>
import ToolPanel from "@ogw_front/components/ToolPanel";
import { applyCameraOptions } from "@ogw_internal/stores/hybrid_viewer_camera";
import { useDataStore } from "@ogw_front/stores/data";
import { useDebounceFn } from "@vueuse/core";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { newInstance as vtkGenericRenderWindow } from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";
import { newInstance as vtkImplicitPlaneWidget } from "@kitware/vtk.js/Widgets/Widgets3D/ImplicitPlaneWidget";
import { newInstance as vtkWidgetManager } from "@kitware/vtk.js/Widgets/Core/WidgetManager";

const AXIS_SCALE = 0.45;
const SIZE_RATIO = 0.1;
const DEBOUNCE_DELAY = 200;
const CHANGE_THRESHOLD = 1e-4;

const show = defineModel("show", { type: Boolean, default: false });
const dataStore = useDataStore();
const hybridViewerStore = useHybridViewerStore();

const isExpanded = ref(true);
const targetAllVisible = ref(true);
const selectedDatasetIds = ref([]);
const planes = ref([{ origin: [0, 0, 0], normal: [1, 0, 0] }]);

const allItems = dataStore.refAllItems();
const availableDatasets = computed(() =>
  allItems.value.map((item) => ({ title: item.name || item.id, value: item.id })),
);

const widgetContainer = useTemplateRef("widgetContainer");
let localRenderWindow = undefined;
let widgetManager = undefined;
let planeWidget = undefined;
let widgetHandle = undefined;
let fromWidget = false;
let maxDistance = 0;
let isLimitingCameraZoom = false;

function getSceneBounds() {
  const targetIds = targetAllVisible.value
    ? allItems.value.map((item) => item.id)
    : selectedDatasetIds.value;

  const actors = targetIds.map((id) => hybridViewerStore.hybridDb[id]?.actor).filter(Boolean);
  const activeActors =
    actors.length > 0
      ? actors
      : Object.values(hybridViewerStore.hybridDb)
          .map((entry) => entry.actor)
          .filter(Boolean);

  if (activeActors.length === 0) {
    return [-1, 1, -1, 1, -1, 1];
  }
  let combinedBounds = [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity];
  for (const actor of activeActors) {
    const bounds = actor.getBounds();
    combinedBounds = [
      Math.min(combinedBounds[0], bounds[0]),
      Math.max(combinedBounds[1], bounds[1]),
      Math.min(combinedBounds[2], bounds[2]),
      Math.max(combinedBounds[3], bounds[3]),
      Math.min(combinedBounds[4], bounds[4]),
      Math.max(combinedBounds[5], bounds[5]),
    ];
  }
  return combinedBounds;
}

function getSceneCenter() {
  const [xmin, xmax, ymin, ymax, zmin, zmax] = getSceneBounds();
  return [
    Number(((xmin + xmax) / 2).toFixed(4)),
    Number(((ymin + ymax) / 2).toFixed(4)),
    Number(((zmin + zmax) / 2).toFixed(4)),
  ];
}

function getCubicBounds() {
  const [xmin, xmax, ymin, ymax, zmin, zmax] = getSceneBounds();
  const center = [(xmin + xmax) / 2, (ymin + ymax) / 2, (zmin + zmax) / 2];
  const halfExtent = Math.max(xmax - xmin, ymax - ymin, zmax - zmin) / 2;

  return [
    center[0] - halfExtent,
    center[0] + halfExtent,
    center[1] - halfExtent,
    center[1] + halfExtent,
    center[2] - halfExtent,
    center[2] + halfExtent,
  ];
}

function hasPlaneChanged(origin, normal, currentOrigin, currentNormal) {
  return (
    origin.some((val, idx) => Math.abs(val - currentOrigin[idx]) > CHANGE_THRESHOLD) ||
    normal.some((val, idx) => Math.abs(val - currentNormal[idx]) > CHANGE_THRESHOLD)
  );
}

function limitCameraZoomOut(camera) {
  if (maxDistance <= 0 || isLimitingCameraZoom) {
    return;
  }
  const currentDist = camera.getDistance();
  if (currentDist <= maxDistance + CHANGE_THRESHOLD) {
    return;
  }

  isLimitingCameraZoom = true;
  const focal = camera.getFocalPoint();
  const pos = camera.getPosition();
  const ratio = maxDistance / currentDist;

  camera.setPosition(
    focal[0] + (pos[0] - focal[0]) * ratio,
    focal[1] + (pos[1] - focal[1]) * ratio,
    focal[2] + (pos[2] - focal[2]) * ratio,
  );
  localRenderWindow.getRenderWindow().render();
  isLimitingCameraZoom = false;
}

function setupWidgetStateEvents(widgetState) {
  widgetState.onModified(() => {
    const origin = widgetState.getOrigin().map((val) => Number(val.toFixed(4)));
    const normal = widgetState.getNormal().map((val) => Number(val.toFixed(4)));
    if (!hasPlaneChanged(origin, normal, planes.value[0].origin, planes.value[0].normal)) {
      return;
    }

    fromWidget = true;
    planes.value[0].origin = origin;
    planes.value[0].normal = normal;
    fromWidget = false;
    debouncedApply();
  });
}

function initLocalWidget(container) {
  container.addEventListener("wheel", (event) => event.stopPropagation(), { passive: true });
  localRenderWindow = vtkGenericRenderWindow({
    background: [0, 0, 0, 0],
    listenWindowResize: false,
  });
  localRenderWindow.setContainer(container);
  const camera = localRenderWindow.getRenderer().getActiveCamera();
  camera.onModified(() => limitCameraZoomOut(camera));
  const canvas = localRenderWindow.getApiSpecificRenderWindow().getCanvas();
  Object.assign(canvas.style, { width: "100%", height: "100%", background: "transparent" });
  localRenderWindow.resize();
  widgetManager = vtkWidgetManager();
  widgetManager.setRenderer(localRenderWindow.getRenderer());
  planeWidget = vtkImplicitPlaneWidget();
  widgetHandle = widgetManager.addWidget(planeWidget);
  widgetHandle.setAxisScale(AXIS_SCALE);
  widgetHandle.setHandleSizeRatio(SIZE_RATIO);
  widgetHandle.placeWidget(getCubicBounds());
  if (planes.value[0].origin.every((val) => val === 0)) {
    planes.value[0].origin = getSceneCenter();
  }
  const widgetState = planeWidget.getWidgetState();
  widgetState.setOrigin(planes.value[0].origin);
  widgetState.setNormal(planes.value[0].normal);
  setupWidgetStateEvents(widgetState);
  syncLocalCamera();
}

watch(widgetContainer, (container) => {
  if (container) {
    const domElement = container.$el || container;
    initLocalWidget(domElement);
  }
});

watch(
  planes,
  () => {
    if (fromWidget || !planeWidget) {
      return;
    }
    const widgetState = planeWidget.getWidgetState();
    widgetState.setOrigin(planes.value[0].origin);
    widgetState.setNormal(planes.value[0].normal);
    localRenderWindow.getRenderWindow().render();
    debouncedApply();
  },
  { deep: true },
);

onBeforeUnmount(() => {
  localRenderWindow?.delete();
});

function syncLocalCamera() {
  if (!localRenderWindow) {
    return;
  }
  const renderer = localRenderWindow.getRenderer();
  const camera = renderer.getActiveCamera();
  applyCameraOptions(camera, hybridViewerStore.camera_options);
  renderer.resetCamera();
  maxDistance = camera.getDistance();
  localRenderWindow.getRenderWindow().render();
}

watch(() => hybridViewerStore.camera_options, syncLocalCamera, { deep: true });

function addPlane() {
  planes.value.push({ origin: getSceneCenter(), normal: [1, 0, 0] });
}

function removePlane(index) {
  planes.value.splice(index, 1);
}

function flipNormal(plane) {
  plane.normal = plane.normal.map((normal) => -normal);
}

function updateWidgetPlacement() {
  if (!widgetHandle || !localRenderWindow) {
    return;
  }
  widgetHandle.placeWidget(getCubicBounds());
  widgetHandle.setAxisScale(AXIS_SCALE);
  widgetHandle.setHandleSizeRatio(SIZE_RATIO);
  syncLocalCamera();
}

const debouncedApply = useDebounceFn(() => applyClippingPlanes(), DEBOUNCE_DELAY);

watch(
  [show, targetAllVisible, selectedDatasetIds, allItems],
  ([visible]) => {
    if (visible) {
      updateWidgetPlacement();
      debouncedApply();
    }
  },
  { immediate: true },
);

async function applyClippingPlanes() {
  const allIds = allItems.value.map((item) => item.id);
  if (allIds.length === 0) {
    return;
  }

  const targetIds = targetAllVisible.value ? allIds : selectedDatasetIds.value;
  const untargetedIds = allIds.filter((id) => !targetIds.includes(id));
  const planesData = planes.value.map((plane) => ({
    origin: plane.origin.map(Number),
    normal: plane.normal.map(Number),
  }));

  if (targetIds.length > 0) {
    await hybridViewerStore.setClippingPlanes(targetIds, planesData);
  }
  if (untargetedIds.length > 0) {
    await hybridViewerStore.setClippingPlanes(untargetedIds, []);
  }
}

async function resetClippingPlanes() {
  fromWidget = true;
  const center = getSceneCenter();
  planes.value = [{ origin: center, normal: [1, 0, 0] }];
  if (planeWidget) {
    const widgetState = planeWidget.getWidgetState();
    widgetState.setOrigin(center);
    widgetState.setNormal([1, 0, 0]);
    localRenderWindow.getRenderWindow().render();
  }
  fromWidget = false;
  await applyClippingPlanes();
}

async function removeClippingPlanes() {
  const allIds = allItems.value.map((item) => item.id);
  if (allIds.length > 0) {
    await hybridViewerStore.setClippingPlanes(allIds, []);
  }
}

function close() {
  show.value = false;
}
</script>

<template>
  <ToolPanel v-model="show" title="Clipping Planes" :width="360" :click-outside="false">
    <v-card-text v-if="isExpanded" class="pa-3 max-panel-height overflow-y-auto">
      <v-sheet
        ref="widgetContainer"
        height="180"
        color="transparent"
        class="rounded-lg mb-3 overflow-hidden"
      />
      <v-switch
        v-model="targetAllVisible"
        label="Apply to all visible datasets"
        color="primary"
        density="compact"
        hide-details
        class="mb-2 text-caption"
      />

      <v-select
        v-if="!targetAllVisible"
        v-model="selectedDatasetIds"
        :items="availableDatasets"
        label="Select datasets"
        multiple
        chips
        closable-chips
        variant="outlined"
        density="compact"
        hide-details
        class="mb-3 text-caption"
      />

      <v-divider class="my-2" />

      <v-row align="center" justify="space-between" no-gutters class="mb-2">
        <v-col class="text-caption font-weight-bold">Planes ({{ planes.length }})</v-col>
        <v-col cols="auto">
          <v-btn size="x-small" variant="tonal" color="primary" icon="mdi-plus" @click="addPlane" />
        </v-col>
      </v-row>

      <v-card
        v-for="(plane, idx) in planes"
        :key="idx"
        variant="outlined"
        class="pa-2 mb-3 rounded-lg border-opacity-25"
      >
        <v-row align="center" justify="space-between" no-gutters class="mb-1">
          <v-col class="text-caption font-weight-medium">Plane #{{ idx + 1 }}</v-col>
          <v-col cols="auto">
            <v-btn
              icon="mdi-trash-can-outline"
              size="x-small"
              variant="text"
              color="error"
              @click="removePlane(idx)"
            />
          </v-col>
        </v-row>

        <v-row no-gutters class="mb-1">
          <v-col class="text-caption text-medium-emphasis">Origin [X, Y, Z]</v-col>
        </v-row>
        <v-row dense class="mb-2">
          <v-col v-for="axis in 3" :key="'orig-' + axis" cols="4">
            <v-text-field
              v-model.number="plane.origin[axis - 1]"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
              step="any"
              class="text-caption"
            />
          </v-col>
        </v-row>

        <v-row align="center" justify="space-between" no-gutters class="mb-1">
          <v-col class="text-caption text-medium-emphasis">Normal [X, Y, Z]</v-col>
          <v-col cols="auto">
            <v-btn
              size="x-small"
              variant="text"
              color="primary"
              prepend-icon="mdi-swap-horizontal"
              class="text-none text-caption px-1"
              @click="flipNormal(plane)"
            >
              Invert Normal
            </v-btn>
          </v-col>
        </v-row>
        <v-row dense>
          <v-col v-for="axis in 3" :key="'norm-' + axis" cols="4">
            <v-text-field
              v-model.number="plane.normal[axis - 1]"
              type="number"
              variant="outlined"
              density="compact"
              hide-details
              step="any"
              class="text-caption"
            />
          </v-col>
        </v-row>
      </v-card>
    </v-card-text>

    <template #actions>
      <v-card-actions v-if="isExpanded" class="justify-space-between px-3 pb-3 pt-0">
        <v-btn
          variant="text"
          size="small"
          color="error"
          class="text-caption text-none"
          @click="removeClippingPlanes"
        >
          Remove Clipping
        </v-btn>
        <v-btn
          variant="tonal"
          size="small"
          color="secondary"
          class="text-caption text-none"
          @click="resetClippingPlanes"
        >
          Reset
        </v-btn>
      </v-card-actions>
    </template>
  </ToolPanel>
</template>

<style scoped>
.max-panel-height {
  max-height: 520px;
}
</style>
