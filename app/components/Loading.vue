<script setup>
const { logo } = defineProps({
  logo: {
    type: String,
    default: "",
  },
});

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
        class="d-flex align-center justify-center transition-swing"
        style="
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(0, 0, 0, 0.45);
          backdrop-filter: blur(10px);
          z-index: 2400;
          pointer-events: auto;
        "
      >
        <div
          style="
            position: absolute;
            inset: 0;
            background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0);
            background-size: 40px 40px;
            background-position: center;
            pointer-events: none;
          "
        />

        <div
          class="d-flex flex-column align-center text-center"
          style="max-width: 650px; width: 100%; padding: 0 24px; gap: 1.5rem"
        >
          <LoadingHeader :logo="logo" />
          <LoadingEcoMessages />
          <LoadingProgress :progress="progress" />
          <LoadingFooter />
        </div>
      </div>
    </Teleport>
  </div>
</template>
