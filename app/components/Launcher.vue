<script setup>
import Loading from "@ogw_front/components/Loading";
import Recaptcha from "@ogw_front/components/Recaptcha";
import { Status } from "@ogw_front/utils/status";
import { appMode } from "@ogw_front/utils/local/app_mode";
import { useInfraStore } from "@ogw_front/stores/infra";

const { logo, appName, authenticated } = defineProps({
  logo: { type: String, required: false, default: "" },
  appName: { type: String, required: true },
  authenticated: { type: Boolean, default: false },
});

const infraStore = useInfraStore();
if (infraStore.app_mode !== appMode.CLOUD) {
  infraStore.create_backend();
}

function submit() {
  return infraStore.create_backend(email.value);
}
</script>

<template>
  <VContainer class="justify">
    <VRow align-content="center" align="center" justify="center">
      {{ authenticated }}
      <VCol v-if="!authenticated" cols="12" align-self="center">
        <slot name="auth" />
      </VCol>
      <VCol
        v-else-if="infraStore.status === Status.NOT_CREATED"
        class="d-flex justify-center align-center"
        cols="12"
        align-self="center"
        z-index="4"
      >
        <VBtn class="load-btn" text="Load the app" color="white" @click="submit" />
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
