<script setup>
import ActionButton from "@ogw_front/components/ActionButton.vue";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const hybridViewerStore = useHybridViewerStore();

const orientations = [
  { label: "Top", value: "top", tooltip: "Top View (+Z)", icon: "mdi-axis-z-arrow" },
  { label: "Bot", value: "bottom", tooltip: "Bottom View (-Z)", icon: "mdi-axis-z-arrow" },
  { label: "N", value: "north", tooltip: "North View (+Y)", icon: "mdi-axis-y-arrow" },
  { label: "S", value: "south", tooltip: "South View (-Y)", icon: "mdi-axis-y-arrow" },
  { label: "E", value: "east", tooltip: "East View (+X)", icon: "mdi-axis-x-arrow" },
  { label: "W", value: "west", tooltip: "West View (-X)", icon: "mdi-axis-x-arrow" },
];

function setOrientation(value) {
  hybridViewerStore.setCameraOrientation(value);
}
</script>

<template>
  <v-menu
    location="left center"
    transition="scale-transition"
    :close-on-content-click="true"
    offset="15"
  >
    <template #activator="{ props }">
      <v-row dense>
        <v-col>
          <ActionButton v-bind="props" icon="mdi-axis-arrow" tooltip="Camera Orientations" />
        </v-col>
      </v-row>
    </template>

    <v-list density="compact" class="pa-2 orientation-menu" elevation="8" rounded="lg">
      <v-row dense no-gutters>
        <v-col v-for="opt in orientations" :key="opt.value" cols="4" class="pa-1">
          <v-tooltip location="top">
            <template #activator="{ props }">
              <v-btn
                v-bind="props"
                icon
                size="42"
                variant="flat"
                class="orientation-btn"
                @click.stop="setOrientation(opt.value)"
              >
                <div class="d-flex flex-column align-center justify-center" style="gap: 2px">
                  <v-icon
                    size="18"
                    :style="opt.value === 'bottom' ? 'transform: rotate(180deg)' : ''"
                  >
                    {{ opt.icon }}
                  </v-icon>
                  <span
                    :class="[
                      'text-label',
                      opt.label.length > 1 ? 'text-label-condensed' : '',
                    ]"
                  >
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
  </v-menu>
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
