<script setup lang="ts">
import type { AppName, AuthToken } from "@ogw_front/types/server";
import type { ImageSource } from "@ogw_front/types/ui";
import Loading from "@ogw_front/components/Loading.vue";
import { Status } from "@ogw_front/utils/status";
import { appMode } from "@ogw_shared/app_mode";
import { createBackend } from "@ogw_front/utils/backend_lifecycle";
import { getCloudUrlParam } from "@ogw_front/utils/cloud";
import { useInfraStore } from "@ogw_front/stores/infra";

interface Props {
  appName: AppName;
  // Firebase ID token for the cloud launch; required in cloud mode.
  authToken?: AuthToken;
  isUserAuthenticated?: boolean;
  logo?: ImageSource;
}

const {
  appName,
  authToken = undefined,
  isUserAuthenticated = false,
  logo = "",
} = defineProps<Props>();

const infraStore = useInfraStore();
// In cloud mode, wait for the user to authenticate and load the app, unless a `?cloud_url=` link
// Points at an already running service: that one is connected straight away, without authentication.
if (infraStore.app_mode !== appMode.CLOUD || getCloudUrlParam() !== undefined) {
  void createBackend(authToken);
}

function cloudCreateBackend(): Promise<void> {
  return createBackend(authToken);
}
</script>

<template>
  <VContainer class="justify">
    <VRow align-content="center" align="center" justify="center">
      <VCol cols="12" align-self="center">
        <slot name="auth" />
      </VCol>
      <VCol
        v-if="isUserAuthenticated && infraStore.status === Status.NOT_CREATED"
        class="d-flex justify-center align-center"
        cols="12"
        align-self="center"
        z-index="4"
      >
        <VBtn
          data-testid="loadAppButton"
          class="load-btn"
          text="Load the app"
          size="x-large"
          color="var(--ogw-launcher-button, white)"
          @click="cloudCreateBackend"
        />
      </VCol>
      <VCol v-else-if="infraStore.status === Status.CREATING">
        <Loading :logo="logo" :app-name="appName" />
      </VCol>
    </VRow>
  </VContainer>
</template>

<style scoped>
.load-btn {
  padding: 0 40px !important;
  height: 50px !important;
  border-radius: 8px;
  text-transform: none !important;
  font-weight: 600;
  letter-spacing: 0.5px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease !important;
}

.load-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}
</style>
