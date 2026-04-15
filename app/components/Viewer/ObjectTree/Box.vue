<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";

const SCROLL_SYNC_DELAY = 50;
const SCROLL_THRESHOLD = 1;
const { title, closable, icon, mdiIcon, scrollTop } = defineProps({
  title: { type: String, required: true },
  closable: { type: Boolean, default: false },
  icon: { type: String, default: "" },
  mdiIcon: { type: String, default: "" },
  scrollTop: { type: Number, default: 0 },
});

const emit = defineEmits(["close", "dragstart", "update:scrollTop"]);

const scrollContainer = ref(undefined);
let isApplyingScroll = false;
let resizeObserver = undefined;

function handleScroll(event) {
  if (isApplyingScroll) {
    return;
  }
  emit("update:scrollTop", event.target.scrollTop);
}

function applyScrollTop(val) {
  if (scrollContainer.value) {
    isApplyingScroll = true;
    scrollContainer.value.scrollTop = val;
    setTimeout(() => {
      isApplyingScroll = false;
    }, SCROLL_SYNC_DELAY);
  }
}

onMounted(() => {
  if (scrollContainer.value) {
    applyScrollTop(scrollTop);

    resizeObserver = new ResizeObserver(() => {
      if (
        scrollContainer.value &&
        Math.abs(scrollContainer.value.scrollTop - scrollTop) > SCROLL_THRESHOLD
      ) {
        applyScrollTop(scrollTop);
      }
    });

    resizeObserver.observe(scrollContainer.value);
  }
});

onUnmounted(() => {
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

watch(
  () => scrollTop,
  (newVal) => {
    if (
      scrollContainer.value &&
      Math.abs(scrollContainer.value.scrollTop - newVal) > SCROLL_THRESHOLD
    ) {
      applyScrollTop(newVal);
    }
  },
);
</script>

<template>
  <v-card variant="outlined" class="tree-box d-flex flex-column">
    <v-card-title
      class="tree-box-header d-flex align-center"
      :class="{ 'cursor-grab': closable }"
      :draggable="closable"
      @dragstart="emit('dragstart', $event)"
    >
      <v-img
        v-if="icon"
        :src="icon"
        width="24"
        height="24"
        max-width="24"
        class="mr-2"
        style="filter: brightness(0); display: flex; align-items: center"
      />
      <v-icon v-else-if="mdiIcon" size="24" class="mr-2">{{ mdiIcon }}</v-icon>
      <v-icon v-else-if="closable" size="24" class="mr-2">mdi-drag-variant</v-icon>
      <span
        class="text-subtitle-2 font-weight-bold d-inline-flex align-center"
        style="height: 24px; line-height: 1"
      >
        {{ title }}
      </span>
      <v-spacer />
      <v-btn
        v-if="closable"
        icon="mdi-close"
        variant="text"
        size="x-small"
        @click="emit('close')"
      />
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-0 flex-grow-1 overflow-hidden d-flex flex-column">
      <div
        ref="scrollContainer"
        class="flex-grow-1 overflow-y-auto overflow-x-hidden"
        @scroll="handleScroll"
      >
        <slot />
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.tree-box {
  height: 100%;
  border-radius: 16px;
  background-color: transparent !important;
  backdrop-filter: blur(2px);
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.tree-box-header {
  height: 40px !important;
  padding: 0 8px !important;
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
