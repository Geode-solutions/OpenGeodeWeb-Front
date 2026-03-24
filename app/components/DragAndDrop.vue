<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import DragAndDropInline from "./DragAndDrop/DragAndDropInline.vue";
import DragAndDropOverlay from "./DragAndDrop/DragAndDropOverlay.vue";

const {
  multiple,
  accept,
  loading,
  showExtensions,
  fullscreen,
  inline,
  showOverlay,
  texts = {
    idle: "Click or drag and drop",
    drop: "Drop files here",
    loading: "Loading...",
  },
} = defineProps({
  multiple: { type: Boolean, default: false },
  accept: { type: String, default: "" },
  loading: { type: Boolean, default: false },
  showExtensions: { type: Boolean, default: true },
  fullscreen: { type: Boolean, default: false },
  inline: { type: Boolean, default: true },
  showOverlay: { type: Boolean, default: true },
  texts: { type: Object, default: undefined },
});

const emit = defineEmits(["files-selected"]);

const isDragging = ref(false);
const isInternalDrag = ref(false);
const dragCounter = ref(0);
const fileInput = ref(undefined);

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
  const files = [...event.dataTransfer.files];
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
    v-bind="$props"
    :is-dragging="isDragging"
    @click="triggerFileDialog"
  />

  <DragAndDropOverlay v-bind="$props" :is-dragging="isDragging" />

  <input
    ref="fileInput"
    type="file"
    class="d-none"
    :multiple="multiple"
    :accept="accept"
    @change="handleFileSelect"
  />
</template>
