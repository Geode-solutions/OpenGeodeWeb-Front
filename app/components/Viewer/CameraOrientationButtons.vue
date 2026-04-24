<script setup>
import ActionButton from "@ogw_front/components/ActionButton.vue";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const hybridViewerStore = useHybridViewerStore();

const orientations = [
  { label: "Top", value: "top", tooltip: "Top View (+Z)", icon: "mdi-arrow-down-bold-box" },
  {
    label: "Bottom",
    value: "bottom",
    tooltip: "Bottom View (-Z)",
    icon: "mdi-arrow-up-bold-box",
  },
  { label: "North", value: "north", tooltip: "North View (+Y)", icon: "mdi-arrow-up-bold" },
  { label: "South", value: "south", tooltip: "South View (-Y)", icon: "mdi-arrow-down-bold" },
  { label: "East", value: "east", tooltip: "East View (+X)", icon: "mdi-arrow-right-bold" },
  { label: "West", value: "west", tooltip: "West View (-X)", icon: "mdi-arrow-left-bold" },
];

function setOrientation(value) {
  console.log("Orientation button clicked:", value);
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
                size="small"
                variant="flat"
                color="secondary"
                @click.stop="setOrientation(opt.value)"
              >
                <v-icon size="20">{{ opt.icon }}</v-icon>
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
  min-width: 140px;
  background-color: rgb(var(--v-theme-surface)) !important;
}
</style>
