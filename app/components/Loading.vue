<script setup>
import { Status } from "@ogw_front/utils/status";
import { useInfraStore } from "@ogw_front/stores/infra";

const { logo, appName } = defineProps({
  logo: {
    type: String,
    default: "",
  },
  appName: {
    type: String,
    required: true,
  },
});

const infraStore = useInfraStore();

const extensionStores = computed(() =>
  infraStore.microservices.filter((store) => store.$id !== "back" && store.$id !== "viewer"),
);

const show = ref(false);
const progress = ref(0);

let progressInterval = undefined;

const PROGRESS_THRESHOLD = 90;
const MAX_PROGRESS = 99;
const PROGRESS_INCREMENT_SCALE = 5;
const UPDATE_INTERVAL_MS = 500;
const SLOW_INCREMENT = 0.5;

onMounted(() => {
  show.value = true;
  progressInterval = setInterval(() => {
    if (progress.value < PROGRESS_THRESHOLD) {
      progress.value += Math.random() * PROGRESS_INCREMENT_SCALE;
    } else if (progress.value < MAX_PROGRESS) {
      progress.value += SLOW_INCREMENT;
    }
  }, UPDATE_INTERVAL_MS);
});

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval);
  }
});
</script>

<template>
  <div v-bind="$attrs">
    <Teleport to="body">
      <div
        v-if="show"
        class="transition-swing overflow-y-auto"
        style="position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(10px); pointer-events: auto; z-index: 3;"
      >
        <div
          style="position: fixed;
            inset: 0;
            background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0);
            background-size: 40px 40px;
            background-position: center;
            pointer-events: none; z-index: 0;"
        />

        <div class="d-flex align-center justify-center pa-6" style="min-height: 100%">
          <div
            class="d-flex flex-column align-center text-center w-100"
            style="max-width: 650px; gap: clamp(1rem, 4vh, 2rem)"
          >
            <LoadingHeader :logo="logo" />
            <LoadingEcoMessages :app-name="appName" />
            <LoadingProgress :progress="progress" />

            <div class="d-flex flex-wrap justify-center gap-4 w-100 mt-4">
              <v-chip
                v-for="store in extensionStores"
                :key="store.$id"
                :color="store.status === Status.CONNECTED ? 'success' : 'primary'"
                variant="flat"
              >
                <v-icon
                  start
                  :icon="
                    store.status === Status.CONNECTED ? 'mdi-check-circle' : 'mdi-loading mdi-spin'
                  "
                />
                {{ store.$id.charAt(0).toUpperCase() + store.$id.slice(1) }}
              </v-chip>
            </div>

            <LoadingFooter />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
