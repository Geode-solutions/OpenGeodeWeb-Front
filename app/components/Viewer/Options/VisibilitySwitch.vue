<template>
  <VRow class="pa-0" align="center">
    <VCol cols="auto" justify="center">
      <VIcon size="30" icon="mdi-eye" v-tooltip:left="'Visibility'" />
    </VCol>
    <VCol cols="auto" justify="center">
      <VSwitch v-model="visibility" inset hide-details />
    </VCol>
  </VRow>
</template>

<script setup>
  const visibility = defineModel()
</script>
