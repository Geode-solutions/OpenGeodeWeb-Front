<script setup lang="ts">
import type { ZoomBox } from "@ogw_internal/stores/hybrid_viewer/zoom_box";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const MIN_ZOOM_BOX_PIXELS = 5;

const hybridViewerStore = useHybridViewerStore();
const overlay = useTemplateRef<HTMLDivElement>("overlay");
const box = ref<ZoomBox | undefined>(undefined);

const rectangle_style = computed(() => {
  if (!box.value) {
    return undefined;
  }
  const { x_min, y_min, x_max, y_max } = box.value;
  return {
    left: `${Math.min(x_min, x_max)}px`,
    top: `${Math.min(y_min, y_max)}px`,
    width: `${Math.abs(x_max - x_min)}px`,
    height: `${Math.abs(y_max - y_min)}px`,
  };
});

function overlaySize(): { width: number; height: number } {
  const rect = overlay.value?.getBoundingClientRect();
  return { width: rect?.width ?? 0, height: rect?.height ?? 0 };
}

function localPosition(event: PointerEvent): { x: number; y: number } {
  const rect = overlay.value?.getBoundingClientRect();
  return { x: event.clientX - (rect?.left ?? 0), y: event.clientY - (rect?.top ?? 0) };
}

function onPointerDown(event: PointerEvent): void {
  if (event.button !== 0) {
    return;
  }
  const { x, y } = localPosition(event);
  box.value = { x_min: x, y_min: y, x_max: x, y_max: y };
  overlay.value?.setPointerCapture?.(event.pointerId);
}

// Keeps the viewport aspect ratio, anchored at the drag start, so the zoomed view shows exactly what was framed.
function onPointerMove(event: PointerEvent): void {
  if (!box.value) {
    return;
  }
  const { width, height } = overlaySize();
  const { x, y } = localPosition(event);
  const deltaX = x - box.value.x_min;
  const deltaY = y - box.value.y_min;
  const aspect = width / height;
  const boxWidth = Math.max(Math.abs(deltaX), Math.abs(deltaY) * aspect);
  const boxHeight = boxWidth / aspect;
  box.value.x_max = box.value.x_min + Math.sign(deltaX || 1) * boxWidth;
  box.value.y_max = box.value.y_min + Math.sign(deltaY || 1) * boxHeight;
}

function onPointerUp(event: PointerEvent): void {
  if (!box.value) {
    return;
  }
  onPointerMove(event);
  overlay.value?.releasePointerCapture?.(event.pointerId);
  const { width, height } = overlaySize();
  if (Math.abs(box.value.x_max - box.value.x_min) >= MIN_ZOOM_BOX_PIXELS) {
    hybridViewerStore.zoomToBox(box.value, width, height);
  }
  box.value = undefined;
}
</script>

<template>
  <div
    v-if="hybridViewerStore.is_zoom_box_active"
    ref="overlay"
    data-testid="zoomBoxOverlay"
    class="zoom-box-overlay"
    @pointerdown.stop.prevent="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup.stop="onPointerUp"
    @contextmenu.prevent
  >
    <div v-if="rectangle_style" class="zoom-box-rectangle" :style="rectangle_style" />
  </div>
</template>

<style scoped>
.zoom-box-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  cursor: crosshair;
  touch-action: none;
}

.zoom-box-rectangle {
  position: absolute;
  border: 2px dashed rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.15);
  pointer-events: none;
}
</style>
