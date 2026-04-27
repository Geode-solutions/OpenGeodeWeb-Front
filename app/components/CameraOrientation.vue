<script setup>
import GlassCard from "@ogw_front/components/GlassCard";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const { panel, width } = defineProps({
  panel: { type: Boolean, default: false },
  width: { type: Number, default: 400 },
});

const emit = defineEmits(["close", "select"]);

const hybridViewerStore = useHybridViewerStore();

const orientations = [
  { label: "Top", value: "top", tooltip: "Top View", icon: "mdi-axis-z-arrow" },
  { label: "Bot", value: "bottom", tooltip: "Bottom View", icon: "mdi-axis-z-arrow" },
  { label: "N", value: "north", tooltip: "North View", icon: "mdi-axis-y-arrow" },
  { label: "S", value: "south", tooltip: "South View", icon: "mdi-axis-y-arrow" },
  { label: "E", value: "east", tooltip: "East View", icon: "mdi-axis-x-arrow" },
  { label: "W", value: "west", tooltip: "West View", icon: "mdi-axis-x-arrow" },
];

function selectOrientation(value) {
  if (panel) {
    hybridViewerStore.setCameraOrientation(value);
  }
  emit("select", value);
}
</script>

<template>
  <GlassCard
    v-if="panel"
    @click.stop
    title="Camera Orientations"
    :width="width"
    :ripple="false"
    variant="panel"
    padding="pa-0"
    class="position-absolute rounded-xl elevation-24"
    style="z-index: 2; top: 90px; right: 55px"
  >
    <v-card-text class="pa-5">
      <v-row dense no-gutters>
        <v-col v-for="opt in orientations" :key="opt.value" cols="4" class="pa-1">
          <v-tooltip location="top">
            <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                icon
                size="42"
                variant="flat"
                class="orientation-btn"
                @click.stop="selectOrientation(opt.value)"
              >
                <div class="d-flex flex-column align-center justify-center" style="gap: 2px">
                  <v-icon
                    size="18"
                    :style="opt.value === 'bottom' ? 'transform: rotate(180deg)' : ''"
                  >
                    {{ opt.icon }}
                  </v-icon>
                  <span :class="['text-label', opt.label.length > 1 ? 'text-label-condensed' : '']">
                    {{ opt.label }}
                  </span>
                </div>
              </v-btn>
            </template>
            <span>{{ opt.tooltip }}</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-card-text>

    <template #actions>
      <v-card-actions class="justify-center pb-4">
        <v-btn variant="text" color="white" @click="emit('close')">Close</v-btn>
      </v-card-actions>
    </template>
  </GlassCard>

  <v-list v-else density="compact" class="pa-2 orientation-menu" elevation="8" rounded="lg">
    <v-row dense no-gutters>
      <v-col v-for="opt in orientations" :key="opt.value" cols="4" class="pa-1">
        <v-tooltip location="top">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon
              size="42"
              variant="flat"
              class="orientation-btn"
              @click.stop="selectOrientation(opt.value)"
            >
              <div class="d-flex flex-column align-center justify-center" style="gap: 2px">
                <v-icon size="18" :style="opt.value === 'bottom' ? 'transform: rotate(180deg)' : ''">
                  {{ opt.icon }}
                </v-icon>
                <span :class="['text-label', opt.label.length > 1 ? 'text-label-condensed' : '']">
                  {{ opt.label }}
                </span>
              </div>
            </v-btn>
          </template>
          <span>{{ opt.tooltip }}</span>
        </v-tooltip>
      </v-col>
    </v-row>
  </v-list>
</template>

<style scoped>
.orientation-menu {
  min-width: 160px;
  background-color: rgb(var(--v-theme-surface)) !important;
}

.orientation-btn {
  background-color: rgb(var(--v-theme-surface)) !important;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 50%;
}

.text-label {
  font-size: 0.65rem !important;
  font-weight: 900;
  line-height: 1;
  text-transform: uppercase;
}

.text-label-condensed {
  font-size: 0.55rem !important;
  letter-spacing: -0.8px !important;
}
</style>
