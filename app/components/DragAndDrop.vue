<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import DragAndDropInline from "./DragAndDropInternal/DragAndDropInline.vue";
import DragAndDropOverlay from "./DragAndDropInternal/DragAndDropOverlay.vue";
import type { UploadFile } from "@ogw_front/utils/upload_path";
import { useFeedbackStore } from "@ogw_front/stores/feedback";

interface DragAndDropTexts {
  idle: string;
  drop: string;
  loading: string;
}

interface Props {
  multiple?: boolean;
  accept?: string | string[];
  loading?: boolean;
  showExtensions?: boolean;
  fullscreen?: boolean;
  inline?: boolean;
  showOverlay?: boolean;
  texts?: DragAndDropTexts;
  directory?: boolean;
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

const displayed_texts = computed<DragAndDropTexts>(() =>
  directory
    ? { ...texts, idle: "Click or drag and drop a folder", drop: "Drop the folder here" }
    : texts,
);

const feedbackStore = useFeedbackStore();

const emit = defineEmits<{
  "files-selected": [files: UploadFile[]];
  // A folder was dropped outside folder mode: the parent decides whether to warn.
  "folders-ignored": [];
}>();

const isDragging = ref(false);
const isInternalDrag = ref(false);
const dragCounter = ref(0);
const fileInput = ref<HTMLInputElement | undefined>(undefined);

const WILDCARD_SUFFIX_LENGTH = 2;

function isFileAccepted(file: File, acceptValue: string | string[] | undefined): boolean {
  const fileName = (file.name || "").toLowerCase();
  const fileType = (file.type || "").toLowerCase();
  const isVext = fileName.endsWith(".vext");

  if (!acceptValue) {
    return !isVext;
  }
  let rules: string[] = [];
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

async function readAllEntries(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
  // oxlint-disable-next-line promise/avoid-new
  const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => {
    reader.readEntries(resolve, reject);
  });
  if (batch.length === 0) {
    return [];
  }
  return [...batch, ...(await readAllEntries(reader))];
}

async function filesFromEntry(entry: FileSystemEntry, path: string): Promise<UploadFile[]> {
  if (entry.isFile) {
    // oxlint-disable-next-line promise/avoid-new
    const file = await new Promise<File>((resolve, reject) => {
      // oxlint-disable-next-line no-unsafe-type-assertion -- isFile guarantees a FileSystemFileEntry
      (entry as FileSystemFileEntry).file(resolve, reject);
    });
    return [Object.assign(file, { relativePath: path })];
  }
  // oxlint-disable-next-line no-unsafe-type-assertion -- not a file, so a FileSystemDirectoryEntry
  const children = await readAllEntries((entry as FileSystemDirectoryEntry).createReader());
  const nested = await Promise.all(
    children.map((child) => filesFromEntry(child, `${path}/${child.name}`)),
  );
  return nested.flat();
}

async function emitDroppedEntries(entries: FileSystemEntry[]): Promise<void> {
  try {
    const groups = await Promise.all(
      entries.map(async (entry) => {
        const files = await filesFromEntry(entry, entry.name);
        // Files inside a dropped folder are all needed: never filtered out.
        return entry.isDirectory ? files : files.filter((file) => isFileAccepted(file, accept));
      }),
    );
    const files = groups.flat();
    if (files.length > 0) {
      emit("files-selected", files);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    feedbackStore.add_warning(`Could not read the dropped folder: ${message}`);
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
