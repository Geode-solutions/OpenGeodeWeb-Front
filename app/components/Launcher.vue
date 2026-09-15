<script setup lang="ts">
import Loading from "@ogw_front/components/Loading.vue";
import Recaptcha from "@ogw_front/components/Recaptcha.vue";
import { Status } from "@ogw_front/utils/status";
import { appMode } from "@ogw_shared/app_mode";
import { useInfraStore } from "@ogw_front/stores/infra";

interface Props {
  appName: string;
  email?: string;
  isUserAuthenticated?: boolean;
  logo?: string;
}

const { appName, email = undefined, isUserAuthenticated = false, logo = "" } = defineProps<Props>();

const infraStore = useInfraStore();
if (infraStore.app_mode !== appMode.CLOUD) {
  infraStore.create_backend();
}

function cloudCreateBackend(): Promise<void> {
  return infraStore.create_backend(email);
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
          color="white"
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
