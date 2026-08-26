<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import DragAndDropInline from "./DragAndDropInternal/DragAndDropInline.vue";
import DragAndDropOverlay from "./DragAndDropInternal/DragAndDropOverlay.vue";

const { multiple, accept, loading, showExtensions, fullscreen, inline, showOverlay, texts } =
  defineProps({
    multiple: { type: Boolean, default: false },
    accept: { type: [String, Array], default: "" },
    loading: { type: Boolean, default: false },
    showExtensions: { type: Boolean, default: true },
    fullscreen: { type: Boolean, default: false },
    inline: { type: Boolean, default: true },
    showOverlay: { type: Boolean, default: true },
    texts: {
      type: Object,
      default: () => ({
        idle: "Click or drag and drop",
        drop: "Drop files here",
        loading: "Loading...",
      }),
    },
  });

const emit = defineEmits(["files-selected"]);

const isDragging = ref(false);
const isInternalDrag = ref(false);
const dragCounter = ref(0);
const fileInput = ref(undefined);

const WILDCARD_SUFFIX_LENGTH = 2;

function isFileAccepted(file, acceptValue) {
  const fileName = (file.name || "").toLowerCase();
  const fileType = (file.type || "").toLowerCase();
  const isVext = fileName.endsWith(".vext");

  if (!acceptValue) {
    return !isVext;
  }
  let rules = [];
  if (Array.isArray(acceptValue)) {
    rules = acceptValue;
  } else if (typeof acceptValue === "string") {
    rules = acceptValue.split(",");
  }
  rules = rules.map((rule) => String(rule).trim()).filter(Boolean);
  if (rules.length === 0) {
    return !isVext;
  }

  return rules.some((rule) => {
    let cleanRule = rule.toLowerCase();
    if (!cleanRule) {
      return !isVext;
    }
    if (cleanRule === "*" || cleanRule === "*.*") {
      return !isVext;
    }
    if (cleanRule.startsWith("*.")) {
      cleanRule = cleanRule.slice(1);
    }
    if (cleanRule.startsWith(".")) {
      return fileName.endsWith(cleanRule);
    }
    if (cleanRule.includes("/")) {
      if (cleanRule.endsWith("/*")) {
        const typeGroup = cleanRule.slice(0, -WILDCARD_SUFFIX_LENGTH);
        return fileType.startsWith(typeGroup);
      }
      return fileType === cleanRule;
    }
    return fileName.endsWith(`.${cleanRule}`);
  });
}

function triggerFileDialog() {
  fileInput.value?.click();
}

function onDragEnter(event) {
  if (!isInternalDrag.value && event.dataTransfer.types.includes("Files")) {
    dragCounter.value += 1;
    isDragging.value = true;
  }
}

function onDragLeave() {
  dragCounter.value -= 1;
  if (dragCounter.value <= 0) {
    isDragging.value = false;
    dragCounter.value = 0;
  }
}

function onDragOver(event) {
  if (!isInternalDrag.value && event.dataTransfer.types.includes("Files")) {
    event.preventDefault();
  }
}

function onDrop(event) {
  event.preventDefault();
  dragCounter.value = 0;
  isDragging.value = false;
  const files = [...event.dataTransfer.files].filter((file) => isFileAccepted(file, accept));
  if (files.length > 0) {
    emit("files-selected", files);
  }
}

function onKeyDown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    isDragging.value = false;
    dragCounter.value = 0;
  }
}

function handleFileSelect(event) {
  const files = [...event.target.files];
  if (files.length > 0) {
    emit("files-selected", files);
  }
  event.target.value = "";
}

function onInternalDragStart() {
  isInternalDrag.value = true;
}

function onInternalDragEnd() {
  isInternalDrag.value = false;
}

onMounted(() => {
  globalThis.addEventListener("dragstart", onInternalDragStart);
  globalThis.addEventListener("dragend", onInternalDragEnd);
  globalThis.addEventListener("dragenter", onDragEnter);
  globalThis.addEventListener("dragover", onDragOver);
  globalThis.addEventListener("dragleave", onDragLeave);
  globalThis.addEventListener("drop", onDrop);
  globalThis.addEventListener("keydown", onKeyDown);
});

onUnmounted(() => {
  globalThis.removeEventListener("dragstart", onInternalDragStart);
  globalThis.removeEventListener("dragend", onInternalDragEnd);
  globalThis.removeEventListener("dragenter", onDragEnter);
  globalThis.removeEventListener("dragover", onDragOver);
  globalThis.removeEventListener("dragleave", onDragLeave);
  globalThis.removeEventListener("drop", onDrop);
  globalThis.removeEventListener("keydown", onKeyDown);
});

defineExpose({ triggerFileDialog });
</script>

<template>
  <DragAndDropInline
    v-if="inline"
    :is-dragging
    :loading
    :texts
    :accept
    :show-extensions
    @click="triggerFileDialog"
  />

  <DragAndDropOverlay
    v-if="isDragging && showOverlay"
    :is-dragging
    :show-overlay
    :fullscreen
    :loading
    :texts
    :multiple
    :accept
    :show-extensions
  />

  <input ref="fileInput" type="file" class="d-none" :multiple :accept @change="handleFileSelect" />
</template>

<style>
.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
