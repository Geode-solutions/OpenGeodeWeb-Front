<script setup lang="ts">
import { useInfraStore } from "@ogw_front/stores/infra";

const infraStore = useInfraStore();
</script>

<template>
  <slot v-if="infraStore.microservices_connected" />
</template>
