<script setup lang="ts">
import { formatCrs, formatCrsCode } from "@ogw_front/utils/crs";
import { useCrsStore } from "@ogw_front/stores/crs";

const crsStore = useCrsStore();
const label = computed<string>(() =>
  crsStore.projectCrs
    ? `CRS: ${formatCrsCode(crsStore.projectCrs)} · ${crsStore.projectCrs.name}`
    : "No CRS",
);
</script>

<template>
  <!-- Under the XYZ axes, drawn by the viewer in the bottom right corner -->
  <v-btn
    data-testid="projectCrs"
    class="project-crs text-none"
    size="small"
    variant="tonal"
    prepend-icon="mdi-earth"
    :disabled="!crsStore.crsEditEnabled"
    v-tooltip="formatCrs(crsStore.projectCrs)"
    @click="crsStore.requestProjectCrsEdit()"
  >
    <span class="text-truncate">{{ label }}</span>
  </v-btn>
</template>

<style scoped>
.project-crs {
  position: absolute;
  right: 16px;
  bottom: 12px;
  z-index: 1;
  max-width: 360px;
}
</style>
