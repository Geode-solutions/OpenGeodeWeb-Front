<script setup>
import GlassCard from "@ogw_front/components/GlassCard.vue";

const orientations = [
  { direction: "top", icon: "mdi-chevron-up", tooltip: "Top" },
  { direction: "bottom", icon: "mdi-chevron-down", tooltip: "Bottom" },
  { direction: "north", icon: "mdi-chevron-left", tooltip: "North" },
  { direction: "south", icon: "mdi-chevron-right", tooltip: "South" },
  { direction: "east", icon: "mdi-chevron-left", tooltip: "East" },
  { direction: "west", icon: "mdi-chevron-right", tooltip: "West" },
];

const emit = defineEmits(["setOrientation"]);

function setOrientation(direction) {
  emit("setOrientation", direction);
}
</script>

<template>
  <GlassCard padding="pa-2">
    <v-row dense>
      <v-col v-for="orientation in orientations" :key="orientation.direction" cols="4">
        <v-btn icon variant="text" @click="setOrientation(orientation.direction)">
          <v-icon>{{ orientation.icon }}</v-icon>
          <v-tooltip activator="parent" location="top">{{ orientation.tooltip }}</v-tooltip>
        </v-btn>
      </v-col>
    </v-row>
  </GlassCard>
</template>
