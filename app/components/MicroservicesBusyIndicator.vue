<script setup lang="ts">
import { useInfraStore } from "@ogw_front/stores/infra";

const infraStore = useInfraStore();
</script>

<!-- Top-of-page progress bar shown while a microservice request is in flight: the e2e tests wait for it to hide -->
<template>
  <v-progress-linear
    v-if="infraStore.microservices_busy"
    data-testid="microservicesBusyIndicator"
    indeterminate
    color="white"
    class="position-fixed top-0"
    style="z-index: 4"
  />
</template>
