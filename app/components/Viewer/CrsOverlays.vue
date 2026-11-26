<script setup lang="ts">
import CrsAlign from "@ogw_front/components/CrsAlign.vue";
import CrsDialogHost from "@ogw_front/components/CrsDialogHost.vue";
import ProjectCrs from "@ogw_front/components/ProjectCrs.vue";
import ToolPanel from "@ogw_front/components/ToolPanel.vue";
import { useCrsStore } from "@ogw_front/stores/crs";

// Wide enough for the X and Y of the 3 pairs of points
const CRS_ALIGN_PANEL_WIDTH = 380;

const crsStore = useCrsStore();
</script>

<template>
  <ProjectCrs />
  <CrsDialogHost />
  <!-- Points are picked in the viewer: a click there must not close the panel.
       CrsAlign has its own title and close button -->
  <ToolPanel
    v-model="crsStore.showCrsAlign"
    :width="CRS_ALIGN_PANEL_WIDTH"
    :click-outside="false"
    hide-actions
    data-testid="crsAlignPanel"
    :escape-function="crsStore.closeCrsAlign"
  >
    <CrsAlign />
  </ToolPanel>
</template>
