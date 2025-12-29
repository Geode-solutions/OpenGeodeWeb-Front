<template>
  <template v-if="!infra_store.microservices_connected">
    <Launcher />
  </template>
  <template v-else>
    <slot />
  </template>
</template>

<script setup>
  const infra_store = useInfraStore()
</script>
