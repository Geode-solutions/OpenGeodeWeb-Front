<script setup>
import ToolPanel from "@ogw_front/components/ToolPanel";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const show = defineModel("show", { type: Boolean, default: false });
const hybridViewerStore = useHybridViewerStore();

const localPoint1 = ref([0, 0, 0]);
const localPoint2 = ref([0, 0, 0]);

watch(
  () => hybridViewerStore.ruler_point1,
  (point) => {
    if (point) {
      localPoint1.value = [...point];
    }
  },
);

watch(
  () => hybridViewerStore.ruler_point2,
  (point) => {
    if (point) {
      localPoint2.value = [...point];
    }
  },
);

watch(show, (visible) => {
  if (visible) {
    hybridViewerStore.is_ruler_active = true;
  } else if (hybridViewerStore.is_ruler_active) {
    hybridViewerStore.deactivateRuler();
  }
});

watch(
  () => hybridViewerStore.is_ruler_active,
  (active) => {
    if (!active) {
      show.value = false;
    }
  },
);

async function applyManualCoords() {
  hybridViewerStore.ruler_point1 = [...localPoint1.value];
  hybridViewerStore.ruler_point2 = [...localPoint2.value];
  await hybridViewerStore.applyRuler();
}
</script>

<template>
  <ToolPanel
    v-model="show"
    title="Ruler"
    :width="300"
    close-label="Stop ruler"
    :click-outside="false"
  >
    <v-card-text class="pa-3">
      <v-switch
        v-model="hybridViewerStore.ruler_snap"
        data-testid="rulerSnapToggle"
        label="Snap to vertex"
        color="primary"
        density="compact"
        hide-details
        class="mb-4"
      />

      <v-divider class="mb-3" />

      <div class="text-caption font-weight-bold mb-2 text-medium-emphasis">Point 1</div>
      <v-row dense class="mb-1" data-testid="rulerPointCard">
        <v-col v-for="(axis, index) in ['X', 'Y', 'Z']" :key="axis">
          <v-text-field
            v-model.number="localPoint1[index]"
            data-testid="rulerPointCoordInput"
            :label="axis"
            type="number"
            density="compact"
            variant="outlined"
            hide-details
          />
        </v-col>
      </v-row>

      <div class="text-caption font-weight-bold mb-2 mt-3 text-medium-emphasis">Point 2</div>
      <v-row dense class="mb-1" data-testid="rulerPointCard">
        <v-col v-for="(axis, index) in ['X', 'Y', 'Z']" :key="axis">
          <v-text-field
            v-model.number="localPoint2[index]"
            data-testid="rulerPointCoordInput"
            :label="axis"
            type="number"
            density="compact"
            variant="outlined"
            hide-details
          />
        </v-col>
      </v-row>

      <v-btn
        data-testid="rulerApplyButton"
        variant="tonal"
        size="small"
        color="primary"
        block
        class="mt-3 text-caption text-none"
        @click="applyManualCoords"
      >
        Apply
      </v-btn>

      <v-divider class="my-3" />

      <div v-if="hybridViewerStore.ruler_distance !== undefined" class="text-center">
        <div class="text-caption text-medium-emphasis mb-1">Distance</div>
        <div data-testid="rulerDistance" class="text-h6 font-weight-bold">
          {{ hybridViewerStore.ruler_distance.toFixed(4) }}
        </div>
      </div>
      <div v-else class="text-caption text-medium-emphasis text-center">
        Click in the scene to set both points
      </div>
    </v-card-text>

    <template #actions>
      <v-card-actions class="justify-center pb-3 pt-0">
        <v-btn
          data-testid="rulerClearButton"
          variant="text"
          size="small"
          color="error"
          class="text-caption text-none"
          @click="hybridViewerStore.clearRuler()"
        >
          Clear
        </v-btn>
      </v-card-actions>
    </template>
  </ToolPanel>
</template>
