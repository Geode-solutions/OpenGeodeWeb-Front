<script setup lang="ts">
import type { IconName, Index, Message, Title } from "@ogw_front/types/ui";
import type { AppName } from "@ogw_front/types/server";

interface Props {
  appName: AppName;
}

// A message displayed while the application loads, with its icon and title
interface EcoMessage {
  icon: IconName;
  title: Title;
  message: Message;
}

const { appName } = defineProps<Props>();

const ecoMessages = computed<EcoMessage[]>(() => [
  {
    icon: "ph-leaf",
    title: "Why the wait?",
    message: "Your workspace starts on demand, no idle servers running 24/7.",
  },
  {
    icon: "ph-lightning",
    title: "Lower carbon footprint",
    message: "On-demand computing uses up to 70% less energy than always-on servers.",
  },
  {
    icon: "ph-globe-hemisphere-west",
    title: "Your choice matters",
    message: `By using ${appName}, you're part of a more sustainable way to work with data.`,
  },
]);

const MESSAGE_INTERVAL_MS = 5000;
const currentMessage = ref<Index>(0);
let interval: ReturnType<typeof setInterval> | undefined = undefined;

// Fallback only guards against noUncheckedIndexedAccess; currentMessage is always kept in range by the modulo below, so it is never actually used.
const FALLBACK_ECO_MESSAGE = { icon: "", title: "", message: "" };
const currentEcoMessage = computed<EcoMessage>(
  () => ecoMessages.value[currentMessage.value] ?? FALLBACK_ECO_MESSAGE,
);

onMounted(() => {
  interval = setInterval(() => {
    currentMessage.value = (currentMessage.value + 1) % ecoMessages.value.length;
  }, MESSAGE_INTERVAL_MS);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<template>
  <v-sheet color="transparent" min-height="160" class="position-relative overflow-visible mb-4">
    <v-scroll-y-reverse-transition mode="out-in">
      <v-card
        :key="currentMessage"
        rounded="lg"
        class="pa-4 pa-sm-6 border mx-auto"
        color="transparent"
        elevation="0"
        style="
          background: var(--ogw-loading-card-bg, rgba(255, 255, 255, 0.05));
          border-color: var(--ogw-loading-card-border, rgba(255, 255, 255, 0.1)) !important;
        "
      >
        <v-card-title
          class="d-flex align-center ga-3 pa-0 mb-2 mb-sm-3 text-body-1 text-sm-subtitle-1 font-weight-bold text-high-emphasis text-wrap"
        >
          <v-icon
            :icon="currentEcoMessage.icon"
            size="22"
            style="
              filter: var(
                --ogw-loading-icon-glow,
                drop-shadow(0 0 6px rgba(var(--v-theme-primary), 0.6))
              );
            "
          />
          {{ currentEcoMessage.title }}
        </v-card-title>
        <v-card-text
          class="pa-0 text-body-2 text-high-emphasis text-left"
          style="opacity: 0.85; line-height: 1.7"
        >
          {{ currentEcoMessage.message }}
        </v-card-text>
      </v-card>
    </v-scroll-y-reverse-transition>

    <v-row justify="center" class="ga-3 mt-6">
      <v-icon
        v-for="(_, index) in ecoMessages"
        :key="index"
        size="10"
        :icon="index === currentMessage ? 'ph-fill ph-circle' : 'ph-circle'"
        :style="{ opacity: index <= currentMessage ? 1 : 0.25 }"
      />
    </v-row>
  </v-sheet>
</template>
