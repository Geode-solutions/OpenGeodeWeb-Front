<template>
  <slot v-if="infraStore.microservices_connected" />
</template>

<script setup>
  import { useInfraStore } from "@ogw_front/stores/infra"
  const infraStore = useInfraStore()
  console.log("TEST", { infraStore })
</script>
