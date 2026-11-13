<script setup lang="ts">
import { useInfraStore } from "@ogw_front/stores/infra";

// Renders only its slot: there is no root element to receive attributes
defineOptions({ inheritAttrs: false });

const infraStore = useInfraStore();
</script>

<template>
  <slot v-if="infraStore.microservices_connected" />
</template>
