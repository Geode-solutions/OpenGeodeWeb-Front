<script setup lang="ts">
import CrsDialog from "@ogw_front/components/CrsDialog.vue";
import type { DataId } from "@geode/opengeodeweb-microservice/schema_types";
import ProjectCrsDialog from "@ogw_front/components/ProjectCrsDialog.vue";
import { useCrsStore } from "@ogw_front/stores/crs";
import { useDataStore } from "@ogw_front/stores/data";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

const crsStore = useCrsStore();
const dataStore = useDataStore();
const feedbackStore = useFeedbackStore();
const show = ref(false);
const itemId = ref<DataId | undefined>(undefined);

// The app hosts the CRS dialog: the shared tree and info card may offer CRS edits
crsStore.enableCrsEdit();

watch(
  () => crsStore.crsEditRequest,
  async (dataId) => {
    if (dataId === undefined) {
      return;
    }
    try {
      await dataStore.item(dataId);
    } catch {
      // The data was deleted since the edit was offered (e.g. by a snackbar)
      crsStore.clearCrsEditRequest();
      return;
    }
    itemId.value = dataId;
    show.value = true;
  },
  // A request made on a page without a host opens once a host mounts
  { immediate: true },
);

function updateShow(value: boolean): void {
  show.value = value;
  if (!value) {
    crsStore.clearCrsEditRequest();
  }
}

function updateProjectShow(value: boolean): void {
  if (!value) {
    crsStore.clearProjectCrsEditRequest();
  }
}
</script>

<template>
  <div>
    <CrsDialog
      :show="show"
      :item-id="itemId"
      @update:show="updateShow"
      @assigned="feedbackStore.add_success('CRS assigned')"
      @converted="feedbackStore.add_success('CRS converted')"
    />
    <ProjectCrsDialog
      :show="crsStore.projectCrsEditRequest"
      @update:show="updateProjectShow"
      @changed="feedbackStore.add_success('Project CRS changed')"
    />
  </div>
</template>
