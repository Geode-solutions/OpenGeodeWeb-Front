<script setup>
const { logo } = defineProps({
  logo: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <v-row justify="center" class="mb-4 mb-sm-8">
    <v-img
      :src="logo"
      class="responsive-logo"
      style="filter: drop-shadow(0 0 20px rgba(var(--v-theme-primary), 0.4))"
    />
  </v-row>

  <v-card color="transparent" elevation="0" class="mb-4 mb-sm-8 overflow-visible">
    <v-card-title
      class="font-weight-black text-white text-wrap pa-0 d-block responsive-title"
      style="text-shadow: 0 0 20px rgba(255, 255, 255, 0.3)"
    >
      STARTING UP
    </v-card-title>
    <v-divider thickness="3" class="border-opacity-100 mx-auto my-4" color="primary" width="60" />
    <v-card-subtitle
      class="text-subtitle-2 font-weight-bold text-white ls-widest pa-0 text-wrap"
      style="opacity: 0.9"
    >
      YOUR WORKSPACE IS WAKING UP...
    </v-card-subtitle>
  </v-card>
</template>

<style scoped>
.responsive-logo {
  width: clamp(100px, 20vw, 180px);
  height: clamp(100px, 20vw, 180px);
}

.responsive-title {
  font-size: clamp(2rem, 8vw, 4rem) !important;
  line-height: 1.1 !important;
}

.ls-widest {
  letter-spacing: clamp(0.2em, 2vw, 0.6em) !important;
}
</style>
