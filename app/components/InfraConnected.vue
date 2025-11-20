<template>
  <slot v-if="infraStore.microservices_connected" />
</template>

<script setup>
  const infraStore = useInfraStore()
</script>
