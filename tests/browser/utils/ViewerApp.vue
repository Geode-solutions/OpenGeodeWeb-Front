<script setup lang="ts">
import HybridRenderingView from "@ogw_front/components/HybridRenderingView.vue";
import FeedBackSnackers from "@ogw_front/components/FeedBack/Snackers.vue";
import ViewerUI from "@ogw_front/components/Viewer/Ui.vue";
import { useInfraStore } from "@ogw_front/stores/infra";
import { useMenuStore } from "@ogw_front/stores/menu";
import { useViewerContextMenu } from "@ogw_front/composables/viewer_context_menu";

// The viewer as the e2e app hosts it (tests/e2e/app/app/app.vue): the right click opens the circular menu
const infraStore = useInfraStore();
const menuStore = useMenuStore();
const cardContainer = useTemplateRef("cardContainer");
const viewerUI = useTemplateRef("viewerUI");

const { display_menu } = storeToRefs(menuStore);
const { containerWidth, containerHeight, openTreeMenu, openViewerMenu } = useViewerContextMenu(
  cardContainer,
  viewerUI,
);
</script>

<template>
  <v-app data-testid="ogwApp">
    <v-main>
      <div ref="cardContainer" class="w-100 h-100 fill-height" @contextmenu.prevent="openViewerMenu">
        <HybridRenderingView>
          <template #ui>
            <ViewerUI
              ref="viewerUI"
              class="viewer-ui-layer"
              :display-menu="display_menu"
              :container-width="containerWidth"
              :container-height="containerHeight"
              @show-menu="openTreeMenu"
            />
          </template>
        </HybridRenderingView>
      </div>
    </v-main>
    <v-progress-linear
      v-if="infraStore.microservices_busy"
      data-testid="microservicesBusyIndicator"
      indeterminate
      color="white"
      class="position-fixed top-0"
      style="z-index: 4"
    />
    <FeedBackSnackers />
  </v-app>
</template>

<style scoped>
.v-app,
.v-main {
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}
:deep(.viewer-ui-layer),
:deep(.viewer-ui-layer .v-navigation-drawer) {
  z-index: 5 !important;
}
</style>
