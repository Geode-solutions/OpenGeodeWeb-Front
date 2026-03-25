<script setup>
const ecoMessages = [
  {
    icon: "mdi-leaf",
    title: "Why the wait?",
    message: "Your workspace starts on demand, no idle servers running 24/7.",
  },
  {
    icon: "mdi-lightning-bolt-outline",
    title: "Lower carbon footprint",
    message: "On-demand computing uses up to 70% less energy than always-on servers.",
  },
  {
    icon: "mdi-earth",
    title: "Your choice matters",
    message: "By using Vease, you're part of a more sustainable way to work with data.",
  },
];

const MESSAGE_INTERVAL_MS = 3000;
const currentMessage = ref(0);
let interval = undefined;

onMounted(() => {
  interval = setInterval(() => {
    currentMessage.value = (currentMessage.value + 1) % ecoMessages.length;
  }, MESSAGE_INTERVAL_MS);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<template>
  <v-sheet color="transparent" height="160" class="position-relative overflow-visible mb-4">
    <v-scroll-y-reverse-transition mode="out-in">
      <v-card
        :key="currentMessage"
        rounded="lg"
        class="pa-6 border mx-auto"
        color="rgba(255, 255, 255, 0.05)"
        elevation="0"
        style="border-color: rgba(255, 255, 255, 0.1) !important"
      >
        <v-card-title
          class="d-flex align-center ga-3 pa-0 mb-3 text-subtitle-1 font-weight-bold text-white text-wrap"
        >
          <v-icon
            :icon="ecoMessages[currentMessage].icon"
            color="white"
            size="22"
            style="filter: drop-shadow(0 0 6px rgba(var(--v-theme-primary), 0.6))"
          />
          {{ ecoMessages[currentMessage].title }}
        </v-card-title>
        <v-card-text
          class="pa-0 text-body-2 text-white text-left"
          style="opacity: 0.85; line-height: 1.7"
        >
          {{ ecoMessages[currentMessage].message }}
        </v-card-text>
      </v-card>
    </v-scroll-y-reverse-transition>

    <v-row justify="center" class="ga-3 mt-6">
      <v-icon
        v-for="(_, index) in ecoMessages"
        :key="index"
        size="10"
        :color="index <= currentMessage ? 'white' : 'white'"
        :icon="index === currentMessage ? 'mdi-circle' : 'mdi-circle-outline'"
        :style="{ opacity: index <= currentMessage ? 1 : 0.25 }"
      />
    </v-row>
  </v-sheet>
</template>
