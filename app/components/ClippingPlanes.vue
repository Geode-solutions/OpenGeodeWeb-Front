<script setup>
import GlassCard from "@ogw_front/components/GlassCard";
import { applyCameraOptions } from "@ogw_internal/stores/hybrid_viewer_camera";
import { useDataStore } from "@ogw_front/stores/data";
import { useDebounceFn } from "@vueuse/core";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";
import { newInstance as vtkGenericRenderWindow } from "@kitware/vtk.js/Rendering/Misc/GenericRenderWindow";
import vtkImplicitPlaneWidget from "@kitware/vtk.js/Widgets/Widgets3D/ImplicitPlaneWidget";
import vtkWidgetManager from "@kitware/vtk.js/Widgets/Core/WidgetManager";

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
let fromWidget = false;

function getSceneBounds() {
  const actors = Object.values(hybridViewerStore.hybridDb)
    .map((entry) => entry.actor)
    .filter(Boolean);
  if (!actors.length) return [-1, 1, -1, 1, -1, 1];

  return actors.reduce(
    (acc, actor) => {
      const bounds = actor.getBounds();
      return [
        Math.min(acc[0], bounds[0]),
        Math.max(acc[1], bounds[1]),
        Math.min(acc[2], bounds[2]),
        Math.max(acc[3], bounds[3]),
        Math.min(acc[4], bounds[4]),
        Math.max(acc[5], bounds[5]),
      ];
    },
    [Infinity, -Infinity, Infinity, -Infinity, Infinity, -Infinity],
  );
}

function getSceneCenter() {
  const b = getSceneBounds();
  return [0, 2, 4].map((i) => Number(((b[i] + b[i + 1]) / 2).toFixed(4)));
}

function initLocalWidget(container) {
  container.addEventListener("wheel", (event) => event.stopPropagation(), { passive: true });

  localRenderWindow = vtkGenericRenderWindow({
    background: [0, 0, 0, 0],
    listenWindowResize: false,
  });
  localRenderWindow.setContainer(container);
  const canvas = localRenderWindow.getApiSpecificRenderWindow().getCanvas();
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.background = "transparent";
  localRenderWindow.resize();

  widgetManager = vtkWidgetManager.newInstance();
  widgetManager.setRenderer(localRenderWindow.getRenderer());

  planeWidget = vtkImplicitPlaneWidget.newInstance();
  const handle = widgetManager.addWidget(planeWidget);
  handle.setAxisScale(0.45);
  handle.setHandleSizeRatio(0.1);
  handle.placeWidget(getSceneBounds());

  if (planes.value[0].origin.every((val) => val === 0)) {
    planes.value[0].origin = getSceneCenter();
  }

  const widgetState = planeWidget.getWidgetState();
  widgetState.setOrigin(planes.value[0].origin);
  widgetState.setNormal(planes.value[0].normal);

  widgetState.onModified(() => {
    fromWidget = true;
    const origin = widgetState.getOrigin();
    const normal = widgetState.getNormal();
    planes.value[0].origin = origin.map((val) => Number(val.toFixed(4)));
    planes.value[0].normal = normal.map((val) => Number(val.toFixed(4)));
    fromWidget = false;
    debouncedApply();
  });

  syncLocalCamera();
}

watch(widgetContainer, (container) => {
  if (container) initLocalWidget(container);
});

watch(
  planes,
  () => {
    if (fromWidget || !planeWidget) return;
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
  if (!localRenderWindow) return;
  const renderer = localRenderWindow.getRenderer();
  applyCameraOptions(renderer.getActiveCamera(), hybridViewerStore.camera_options);
  renderer.resetCamera();
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
  plane.normal = plane.normal.map((n) => -n);
}

const debouncedApply = useDebounceFn(() => applyClippingPlanes(), 200);

watch(
  [show, targetAllVisible, selectedDatasetIds, allItems],
  ([visible]) => {
    if (visible) debouncedApply();
  },
  { immediate: true },
);

async function applyClippingPlanes() {
  const allIds = allItems.value.map((item) => item.id);
  if (!allIds.length) return;

  const targetIds = targetAllVisible.value ? allIds : selectedDatasetIds.value;
  const untargetedIds = allIds.filter((id) => !targetIds.includes(id));
  const planesData = planes.value.map((plane) => ({
    origin: plane.origin.map(Number),
    normal: plane.normal.map(Number),
  }));

  if (targetIds.length) {
    await hybridViewerStore.setClippingPlanes(targetIds, planesData);
  }
  if (untargetedIds.length) {
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
  if (allIds.length) {
    await hybridViewerStore.setClippingPlanes(allIds, []);
  }
}

function close() {
  show.value = false;
}
</script>

<template>
  <GlassCard
    v-if="show"
    title="Clipping Planes"
    :width="360"
    variant="panel"
    padding="pa-0"
    class="position-absolute rounded-xl elevation-24 clipping-planes-panel"
  >
    <template #header-actions>
      <v-btn
        icon="mdi-chevron-down"
        variant="text"
        density="compact"
        size="small"
        class="mr-1"
        :style="{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)' }"
        @click="isExpanded = !isExpanded"
      />
      <v-btn icon="mdi-close" variant="text" density="compact" size="small" @click="close" />
    </template>

    <v-card-text v-if="isExpanded" class="pa-3 max-panel-height overflow-y-auto">
      <div
        ref="widgetContainer"
        class="rounded-lg mb-3 overflow-hidden"
        style="height: 180px; background: transparent"
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

      <div class="d-flex align-center justify-space-between mb-2">
        <span class="text-caption font-weight-bold">Planes ({{ planes.length }})</span>
        <v-btn size="x-small" variant="tonal" color="primary" icon="mdi-plus" @click="addPlane" />
      </div>

      <v-card
        v-for="(plane, idx) in planes"
        :key="idx"
        variant="outlined"
        class="pa-2 mb-3 rounded-lg border-opacity-25"
      >
        <div class="d-flex align-center justify-space-between mb-1">
          <span class="text-caption font-weight-medium">Plane #{{ idx + 1 }}</span>
          <v-btn
            icon="mdi-trash-can-outline"
            size="x-small"
            variant="text"
            color="error"
            @click="removePlane(idx)"
          />
        </div>

        <div class="text-caption text-medium-emphasis mb-1">Origin [X, Y, Z]</div>
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

        <div class="d-flex align-center justify-space-between mb-1">
          <span class="text-caption text-medium-emphasis">Normal [X, Y, Z]</span>
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
        </div>
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
  </GlassCard>
</template>

<style scoped>
.clipping-planes-panel {
  z-index: 2;
  bottom: 20px;
  right: 65px;
}

.max-panel-height {
  max-height: 520px;
}
</style>
