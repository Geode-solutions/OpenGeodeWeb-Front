<script setup>
const { logo } = defineProps({
  logo: {
    type: String,
    required: true,
  },
});

const show = ref(false);
const progress = ref(0);

onMounted(() => {
  show.value = true;
});
</script>

<template>
  <v-overlay
    v-model="show"
    persistent
    class="align-center justify-center"
    style="background: rgba(5, 5, 5, 0.1); backdrop-filter: blur(8px)"
  >
    <v-sheet
      position="fixed"
      location="center"
      height="100vh"
      width="100vw"
      color="transparent"
      class="bg-grid-pattern"
      style="z-index: -1"
    />

    <v-container class="text-center" style="max-width: 650px">
      <LoadingHeader :logo="logo" />
      <LoadingEcoMessages />
      <LoadingProgress :progress="progress" />
      <LoadingFooter />
    </v-container>
  </v-overlay>
</template>

<style scoped>
.bg-grid-pattern {
  background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0);
  background-size: 40px 40px;
  background-position: center;
}
</style>
