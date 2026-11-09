<script setup lang="ts">
import FeedBackSnackers from "@ogw_front/components/FeedBack/Snackers.vue";
import HybridRenderingView from "@ogw_front/components/HybridRenderingView.vue";
import InfraConnected from "@ogw_front/components/InfraConnected.vue";
import Launcher from "@ogw_front/components/Launcher.vue";
import { Status } from "@ogw_front/utils/status";
import ViewerUI from "@ogw_front/components/Viewer/Ui.vue";
import { runFunctionWhenMicroservicesConnected } from "@ogw_front/composables/run_function_when_microservices_connected";
import { setIsAppReady } from "@ogw_shared/scripts";
import { useAppStore } from "@ogw_front/stores/app";
import { useInfraStore } from "@ogw_front/stores/infra";
import { useMenuStore } from "@ogw_front/stores/menu";
import { useViewerContextMenu } from "@ogw_front/composables/viewer_context_menu";

const appStore = useAppStore();
const infraStore = useInfraStore();
const menuStore = useMenuStore();
const cardContainer = useTemplateRef("cardContainer");
const viewerUI = useTemplateRef("viewerUI");

const { display_menu } = storeToRefs(menuStore);
const { containerWidth, containerHeight, openTreeMenu, openViewerMenu } = useViewerContextMenu(
  cardContainer,
  viewerUI,
);

// The e2e runner polls this flag (waitForAppReady) before driving the page
runFunctionWhenMicroservicesConnected(() => {
  setIsAppReady(appStore.base_url, true);
});
</script>

<template>
  <v-app>
    <v-main>
      <Launcher v-if="infraStore.status !== Status.CREATED" app-name="OpenGeodeWeb e2e" />
      <InfraConnected v-else>
        <div
          ref="cardContainer"
          class="w-100 h-100 fill-height"
          @contextmenu.prevent="openViewerMenu"
        >
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
      </InfraConnected>
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
