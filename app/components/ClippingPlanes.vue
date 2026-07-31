<script setup>
import {
  DEBOUNCE_DELAY,
  DEFAULT_NORMALS,
  getPlaneCssColor,
} from "@ogw_front/utils/clipping_planes";
import ToolPanel from "@ogw_front/components/ToolPanel";
import { useClippingPlanesWidget } from "@ogw_front/composables/clipping_planes_widget";
import { useDataStore } from "@ogw_front/stores/data";
import { useDebounceFn } from "@vueuse/core";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const show = defineModel("show", { type: Boolean, default: false });
const dataStore = useDataStore();
const hybridViewerStore = useHybridViewerStore();
const targetAllVisible = ref(true);
const selectedDatasetIds = ref([]);
const planes = ref([{ origin: undefined, normal: [1, 0, 0] }]);
const allItems = dataStore.refAllItems();
const availableDatasets = computed(() =>
  allItems.value.map((item) => ({ title: item.name || item.id, value: item.id })),
);
const widgetContainer = useTemplateRef("widgetContainer");
const debouncedApply = useDebounceFn(() => applyClippingPlanes(), DEBOUNCE_DELAY);
const {
  getSceneCenter,
  syncWidgets,
  syncLocalCamera,
  cleanupLocalWidget,
  initLocalWidget,
  updateWidgetPlacement,
  isFromWidget,
  setFromWidget,
} = useClippingPlanesWidget({
  planes,
  targetAllVisible,
  selectedDatasetIds,
  allItems,
  hybridViewerStore,
  debouncedApply,
});

function addPlane() {
  const normal = DEFAULT_NORMALS[planes.value.length % DEFAULT_NORMALS.length];
  planes.value.push({ origin: getSceneCenter(), normal });
}

function removePlane(index) {
  planes.value.splice(index, 1);
}

function flipNormal(plane) {
  plane.normal = plane.normal.map((component) => -component);
  syncWidgets();
  applyClippingPlanes();
}

async function applyClippingPlanes() {
  const allIds = allItems.value.map((item) => item.id);
  if (allIds.length === 0) {
    return;
  }
  const center = getSceneCenter();
  const targetIds = targetAllVisible.value ? allIds : selectedDatasetIds.value;
  const untargetedIds = allIds.filter((id) => !targetIds.includes(id));
  const planesData = planes.value.map((plane) => ({
    origin: (plane.origin || center).map(Number),
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
  setFromWidget(true);
  planes.value = [{ origin: undefined, normal: [1, 0, 0] }];
  updateWidgetPlacement({ isReset: true });
  setFromWidget(false);
  await applyClippingPlanes();
}

async function removeClippingPlanes() {
  const allIds = allItems.value.map((item) => item.id);
  await hybridViewerStore.setClippingPlanes(allIds, []);
}

watch(widgetContainer, (container) => {
  if (container) {
    initLocalWidget(container.$el || container);
  }
});

watch(
  planes,
  () => {
    if (isFromWidget()) {
      return;
    }
    syncWidgets();
    debouncedApply();
  },
  { deep: true },
);

watch(show, (visible) => {
  if (visible) {
    updateWidgetPlacement({ isReset: true });
    applyClippingPlanes();
  }
});

watch(
  [targetAllVisible, selectedDatasetIds],
  () => {
    if (show.value) {
      updateWidgetPlacement({ isReset: true });
      applyClippingPlanes();
    }
  },
  { deep: true },
);

watch(allItems, () => {
  if (show.value) {
    updateWidgetPlacement({ isReset: true });
    applyClippingPlanes();
  }
});

watch(
  () => Object.values(hybridViewerStore.hybridDb).filter((entry) => entry && entry.actor).length,
  (actorCount) => {
    if (show.value && actorCount > 0) {
      updateWidgetPlacement({ isReset: true });
      applyClippingPlanes();
    }
  },
);

watch(() => hybridViewerStore.camera_options, syncLocalCamera, { deep: true });

onBeforeUnmount(cleanupLocalWidget);
</script>

<template>
  <ToolPanel v-model="show" title="Clipping Planes" :width="360" :click-outside="false">
    <v-card-text class="pa-3 max-panel-height overflow-y-auto">
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
        class="pa-2 mb-3 rounded-lg border-opacity-50"
        :style="{ borderColor: getPlaneCssColor(idx) }"
      >
        <v-row align="center" justify="space-between" no-gutters class="mb-1">
          <v-col cols="auto" class="d-flex align-center">
            <v-chip
              size="x-small"
              variant="flat"
              :style="{
                backgroundColor: getPlaneCssColor(idx),
                color: 'white',
              }"
              class="font-weight-bold"
            >
              Plane #{{ idx + 1 }}
            </v-chip>
          </v-col>
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
        <v-row v-if="plane.origin" dense class="mb-2">
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
        <v-row v-else dense class="mb-2">
          <v-col v-for="axis in 3" :key="'orig-placeholder-' + axis" cols="4">
            <v-text-field
              placeholder="—"
              variant="outlined"
              density="compact"
              hide-details
              disabled
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
      <v-card-actions class="justify-space-between px-3 pb-3 pt-0">
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
