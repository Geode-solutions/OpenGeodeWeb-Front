<script setup lang="ts">
import { type ZoomBox, viewportShapedBox } from "@ogw_internal/stores/hybrid_viewer/zoom_box";
import type { Position } from "@vueuse/core";
import { useHybridViewerStore } from "@ogw_front/stores/hybrid_viewer";

const MIN_ZOOM_BOX_PIXELS = 5;

const hybridViewerStore = useHybridViewerStore();
const overlay = useTemplateRef<HTMLDivElement>("overlay");
const { left, top, width, height } = useElementBounding(overlay);
const viewport = computed(() => ({ width: width.value, height: height.value }));

function draggedBox(start: Position, end: Position): ZoomBox {
  return viewportShapedBox(
    { x: start.x - left.value, y: start.y - top.value },
    { x: end.x - left.value, y: end.y - top.value },
    viewport.value,
  );
}

const { isSwiping, posStart, posEnd } = usePointerSwipe(overlay, {
  threshold: MIN_ZOOM_BOX_PIXELS,
  disableTextSelect: true,
  onSwipeEnd: async () => {
    try {
      await hybridViewerStore.zoomToBox(draggedBox(posStart, posEnd), viewport.value);
    } catch {
      // The viewer store already reported the failed pick request to the user.
    }
  },
});

const rectangle_style = computed(() => {
  const { start, end } = draggedBox(posStart, posEnd);
  return {
    left: `${Math.min(start.x, end.x)}px`,
    top: `${Math.min(start.y, end.y)}px`,
    width: `${Math.abs(end.x - start.x)}px`,
    height: `${Math.abs(end.y - start.y)}px`,
  };
});
</script>

<template>
  <div ref="overlay" data-testid="zoomBoxOverlay" class="zoom-box-overlay" @contextmenu.prevent>
    <div v-if="isSwiping" class="zoom-box-rectangle" :style="rectangle_style" />
  </div>
</template>

<style scoped>
.zoom-box-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  cursor: crosshair;
}

.zoom-box-rectangle {
  position: absolute;
  border: 2px dashed rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.15);
  pointer-events: none;
}
</style>
