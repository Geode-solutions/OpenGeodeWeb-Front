<script setup lang="ts">
import { constrainZoomBoxToViewport } from "@ogw_internal/stores/hybrid_viewer/zoom_box";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const hybridViewerStore = useHybridViewerStore();
const overlay = useTemplateRef<HTMLDivElement>("overlay");
const drag_start = ref<{ x: number; y: number } | undefined>(undefined);

const rectangle_style = computed(() => {
  const box = hybridViewerStore.zoom_box;
  if (!box) {
    return undefined;
  }
  return {
    left: `${Math.min(box.x_min, box.x_max)}px`,
    top: `${Math.min(box.y_min, box.y_max)}px`,
    width: `${Math.abs(box.x_max - box.x_min)}px`,
    height: `${Math.abs(box.y_max - box.y_min)}px`,
  };
});

function localPosition(event: PointerEvent): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const rect = overlay.value?.getBoundingClientRect() ?? { left: 0, top: 0, width: 0, height: 0 };
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    width: rect.width,
    height: rect.height,
  };
}

function onPointerDown(event: PointerEvent): void {
  if (event.button !== 0) {
    return;
  }
  const { x, y, width, height } = localPosition(event);
  drag_start.value = { x, y };
  overlay.value?.setPointerCapture?.(event.pointerId);
  hybridViewerStore.setZoomBox({ x_min: x, y_min: y, x_max: x, y_max: y }, width, height);
}

function onPointerMove(event: PointerEvent): void {
  if (!drag_start.value) {
    return;
  }
  const { x, y, width, height } = localPosition(event);
  hybridViewerStore.setZoomBox(
    constrainZoomBoxToViewport(drag_start.value, { x, y }, width, height),
    width,
    height,
  );
}

function onPointerUp(event: PointerEvent): void {
  if (!drag_start.value) {
    return;
  }
  onPointerMove(event);
  drag_start.value = undefined;
  overlay.value?.releasePointerCapture?.(event.pointerId);
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
    <div
      v-if="rectangle_style"
      data-testid="zoomBoxRectangle"
      class="zoom-box-rectangle"
      :style="rectangle_style"
    />
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
