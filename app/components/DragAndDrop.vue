<script setup lang="ts">
import { type AcceptRule, filesFromEntry, isFileAccepted } from "@ogw_front/utils/drag_and_drop";
import DragAndDropInline from "./DragAndDropInternal/DragAndDropInline.vue";
import DragAndDropOverlay from "./DragAndDropInternal/DragAndDropOverlay.vue";
import type { DragAndDropTexts } from "@ogw_front/types/props/components_files";
import type { Message } from "@ogw_front/types/ui";
import type { UploadFile } from "@ogw_front/types/files";

interface Props {
  multiple?: boolean;
  accept?: AcceptRule | AcceptRule[];
  loading?: boolean;
  showExtensions?: boolean;
  fullscreen?: boolean;
  inline?: boolean;
  showOverlay?: boolean;
  texts?: DragAndDropTexts;
  directory?: boolean;
}

interface Emits {
  "files-selected": [files: UploadFile[]];
  "folders-ignored": [];
  "folder-read-error": [message: Message];
}

const {
  multiple = false,
  accept = "",
  loading = false,
  showExtensions = true,
  fullscreen = false,
  inline = true,
  showOverlay = true,
  texts = {
    idle: "Click or drag and drop",
    drop: "Drop files here",
    loading: "Loading...",
  },
  directory = false,
  // oxlint-disable-next-line vue/max-props
} = defineProps<Props>();

const displayed_texts = computed<DragAndDropTexts>(() => {
  if (directory) {
    return { ...texts, idle: "Click or drag and drop a folder", drop: "Drop the folder here" };
  }
  return texts;
});

const emit = defineEmits<Emits>();

const isDragging = ref(false);
const isInternalDrag = ref(false);
const dragCounter = ref(0);
const fileInput = ref<HTMLInputElement | undefined>(undefined);

function getErrorMessage(error: unknown): Message {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

function triggerFileDialog(): void {
  fileInput.value?.click();
}

function onDragEnter(event: DragEvent): void {
  if (!isInternalDrag.value && event.dataTransfer?.types.includes("Files")) {
    dragCounter.value += 1;
    isDragging.value = true;
  }
}

function onDragLeave(): void {
  dragCounter.value -= 1;
  if (dragCounter.value <= 0) {
    isDragging.value = false;
    dragCounter.value = 0;
  }
}

function onDragOver(event: DragEvent): void {
  if (!isInternalDrag.value && event.dataTransfer?.types.includes("Files")) {
    event.preventDefault();
  }
}

async function emitDroppedEntries(entries: FileSystemEntry[]): Promise<void> {
  try {
    const groups = await Promise.all(
      entries.map(async (entry) => {
        const files = await filesFromEntry(entry, entry.name);
        // Files inside a dropped folder are all needed: never filtered out.
        if (entry.isDirectory) {
          return files;
        }
        return files.filter((file) => isFileAccepted(file, accept));
      }),
    );
    const files = groups.flat();
    if (files.length > 0) {
      emit("files-selected", files);
    }
  } catch (error) {
    emit("folder-read-error", getErrorMessage(error));
  }
}

function onDrop(event: DragEvent): void {
  event.preventDefault();
  dragCounter.value = 0;
  isDragging.value = false;
  // Entries must be read synchronously: the DataTransfer is emptied once the event returns.
  const entries = [...(event.dataTransfer?.items ?? [])]
    .map((item) => item.webkitGetAsEntry?.())
    .filter((entry): entry is FileSystemEntry => entry !== null && entry !== undefined);
  if (entries.some((entry) => entry.isDirectory)) {
    if (directory) {
      void emitDroppedEntries(entries);
      return;
    }
    emit("folders-ignored");
    void emitDroppedEntries(entries.filter((entry) => entry.isFile));
    return;
  }
  const files = [...(event.dataTransfer?.files ?? [])].filter((file) =>
    isFileAccepted(file, accept),
  );
  if (files.length > 0) {
    emit("files-selected", files);
  }
}

function onKeyDown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    isDragging.value = false;
    dragCounter.value = 0;
  }
}

function handleFileSelect(event: Event): void {
  const target = event.target as HTMLInputElement;
  const files = [...(target.files ?? [])];
  if (files.length > 0) {
    emit("files-selected", files);
  }
  target.value = "";
}

function onInternalDragStart(): void {
  isInternalDrag.value = true;
}

function onInternalDragEnd(): void {
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
    :texts="displayed_texts"
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
    :texts="displayed_texts"
    :multiple
    :accept
    :show-extensions
  />

  <input
    ref="fileInput"
    type="file"
    class="d-none"
    :multiple
    :accept
    :webkitdirectory="directory"
    @change="handleFileSelect"
  />
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
