<script setup>
import GlobalObjects from "@ogw_front/components/Viewer/ObjectTree/Views/GlobalObjects.vue";
import ModelComponents from "@ogw_front/components/Viewer/ObjectTree/Views/ModelComponents.vue";
import ViewerObjectTreeBox from "@ogw_front/components/Viewer/ObjectTree/Box.vue";
import { geode_objects } from "@ogw_front/assets/geode_objects";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

const WIDTH_MIN = 200;
const HEIGHT_MIN = 150;
const GAP_WIDTH = 10;
const PERCENT_100 = 100;

const TOTAL_PERCENT = 100;
const MAX_PANEL_WIDTH_RATIO = 0.8;

const { containerWidth } = defineProps({
  containerWidth: { type: Number, required: true },
});

const treeviewStore = useTreeviewStore();
const emit = defineEmits(["show-menu"]);

const maxWidth = computed(() => containerWidth * MAX_PANEL_WIDTH_RATIO);

const mainView = computed(() => treeviewStore.opened_views[0]);
const additionalViews = computed(() => treeviewStore.opened_views.slice(1));

const totalWidth = computed(() => {
  const hasAdditional = additionalViews.value.length > 0;
  const gap = hasAdditional ? GAP_WIDTH : 0;
  const secondColWidth = hasAdditional ? treeviewStore.additionalPanelWidth : 0;
  return `${treeviewStore.panelWidth + secondColWidth + gap}px`;
});

const rowHeights = computed({
  get: () => treeviewStore.rowHeights,
  set: (val) => treeviewStore.setRowHeights(val),
});
const draggedIndex = ref(undefined);

watch(
  () => additionalViews.value.length,
  (newLength) => {
    if (newLength > 0 && rowHeights.value.length !== newLength) {
      treeviewStore.setRowHeights(Array.from({ length: newLength }).fill(PERCENT_100 / newLength));
    }
  },
  { immediate: true },
);

watch([maxWidth, () => additionalViews.value.length], ([newMax]) => {
  const hasAdditional = additionalViews.value.length > 0;
  const gap = hasAdditional ? GAP_WIDTH : 0;
  const total =
    treeviewStore.panelWidth + (hasAdditional ? treeviewStore.additionalPanelWidth : 0) + gap;

  if (total > newMax) {
    if (hasAdditional) {
      const newAdditionalWidth = newMax - treeviewStore.panelWidth - gap;
      if (newAdditionalWidth < WIDTH_MIN) {
        treeviewStore.setAdditionalPanelWidth(WIDTH_MIN);
        const newMainWidth = newMax - WIDTH_MIN - gap;
        treeviewStore.setPanelWidth(Math.max(WIDTH_MIN, newMainWidth));
      } else {
        treeviewStore.setAdditionalPanelWidth(newAdditionalWidth);
      }
    } else {
      treeviewStore.setPanelWidth(Math.max(WIDTH_MIN, newMax));
    }
  }
});

function onDragStart(index) {
  draggedIndex.value = index;
}

function onDragOver(event) {
  event.preventDefault();
}

function onDrop(targetIndex) {
  if (draggedIndex.value !== undefined && draggedIndex.value !== targetIndex) {
    treeviewStore.moveView(draggedIndex.value, targetIndex);
  }
  draggedIndex.value = undefined;
}

function onResizeStart(event) {
  const startWidth = treeviewStore.panelWidth;
  const startX = event.clientX;
  function resize(move_event) {
    const deltaX = move_event.clientX - startX;
    let newWidth = Math.max(WIDTH_MIN, startWidth + deltaX);
    const hasAdditional = additionalViews.value.length > 0;
    const gap = hasAdditional ? GAP_WIDTH : 0;
    const currentTotalWidth =
      newWidth + (hasAdditional ? treeviewStore.additionalPanelWidth : 0) + gap;
    if (currentTotalWidth > maxWidth.value) {
      newWidth = maxWidth.value - (hasAdditional ? treeviewStore.additionalPanelWidth : 0) - gap;
    }
    treeviewStore.setPanelWidth(Math.max(WIDTH_MIN, newWidth));
    document.body.style.userSelect = "none";
  }
  function stopResize() {
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
    document.body.style.userSelect = "";
  }
  document.addEventListener("mousemove", resize);
  document.addEventListener("mouseup", stopResize);
}

function onAdditionalResizeStart(event) {
  const startWidth = treeviewStore.additionalPanelWidth;
  const startX = event.clientX;
  function resize(move_event) {
    const deltaX = move_event.clientX - startX;
    let newWidth = Math.max(WIDTH_MIN, startWidth + deltaX);
    const currentTotalWidth = treeviewStore.panelWidth + newWidth + GAP_WIDTH;
    if (currentTotalWidth > maxWidth.value) {
      newWidth = maxWidth.value - treeviewStore.panelWidth - GAP_WIDTH;
    }
    treeviewStore.setAdditionalPanelWidth(Math.max(WIDTH_MIN, newWidth));
    document.body.style.userSelect = "none";
  }
  function stopResize() {
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
    document.body.style.userSelect = "";
  }
  document.addEventListener("mousemove", resize);
  document.addEventListener("mouseup", stopResize);
}

function onVerticalResizeStart(event, index) {
  const startY = event.clientY;
  const startHeight1 = rowHeights.value[index];
  const startHeight2 = rowHeights.value[index + 1];
  const containerHeight = event.currentTarget.parentElement.offsetHeight;

  function resize(move_event) {
    const deltaY = move_event.clientY - startY;
    const deltaPercent = (deltaY / containerHeight) * PERCENT_100;
    const minHeightPercent = (HEIGHT_MIN / containerHeight) * PERCENT_100;

    let newHeight1 = startHeight1 + deltaPercent;
    let newHeight2 = startHeight2 - deltaPercent;

    if (newHeight1 < minHeightPercent) {
      newHeight1 = minHeightPercent;
      newHeight2 = startHeight1 + startHeight2 - minHeightPercent;
    } else if (newHeight2 < minHeightPercent) {
      newHeight2 = minHeightPercent;
      newHeight1 = startHeight1 + startHeight2 - minHeightPercent;
    }

    const newHeights = [...rowHeights.value];
    newHeights[index] = newHeight1;
    newHeights[index + 1] = newHeight2;
    treeviewStore.setRowHeights(newHeights);

    document.body.style.userSelect = "none";
    document.body.style.cursor = "ns-resize";
  }

  function stopResize() {
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
    document.body.style.userSelect = "";
    document.body.style.cursor = "";
  }
  document.addEventListener("mousemove", resize);
  document.addEventListener("mouseup", stopResize);
}
</script>

<template>
  <div
    v-if="treeviewStore.items.length > 0"
    class="treeview-container d-flex"
    :style="{ width: totalWidth }"
    @contextmenu.prevent
    @mousedown.stop
  >
    <div
      class="column main-column"
      :style="{
        width: `${treeviewStore.panelWidth}px`,
      }"
    >
      <ViewerObjectTreeBox
        :title="mainView.title"
        mdi-icon="mdi-file-tree-outline"
        :scroll-top="mainView.scrollTop"
        @update:scroll-top="treeviewStore.setScrollTop(mainView.id, $event)"
      >
        <GlobalObjects data-testid="mainObjectTree" @show-menu="emit('show-menu', $event)" />
      </ViewerObjectTreeBox>
    </div>

    <div v-if="additionalViews.length > 0" class="column-separator" @mousedown="onResizeStart" />

    <div
      v-if="additionalViews.length > 0"
      class="column additional-column"
      :style="{
        width: `${treeviewStore.additionalPanelWidth}px`,
      }"
    >
      <template v-for="(view, index) in additionalViews" :key="view.id">
        <div
          class="view-wrapper"
          :class="{
            'drag-over': draggedIndex !== undefined && draggedIndex !== index + 1,
          }"
          :style="{ flex: `0 0 ${rowHeights[index]}%` }"
          @dragover="onDragOver"
          @drop="onDrop(index + 1)"
        >
          <ViewerObjectTreeBox
            :title="view.title"
            :icon="geode_objects[view.geode_object_type]?.image"
            :scroll-top="view.scrollTop"
            closable
            @close="treeviewStore.closeView(index + 1)"
            @dragstart="onDragStart(index + 1)"
            @update:scroll-top="treeviewStore.setScrollTop(view.id, $event)"
          >
            <ModelComponents
              data-testid="modelComponentsObjectTree"
              :id="view.id"
              @show-menu="emit('show-menu', $event)"
            />
          </ViewerObjectTreeBox>
        </div>
        <div
          v-if="index < additionalViews.length - 1"
          class="v-split-resizer"
          @mousedown="onVerticalResizeStart($event, index)"
        />
      </template>
    </div>
    <div
      class="total-resizer"
      @mousedown="
        additionalViews.length > 0 ? onAdditionalResizeStart($event) : onResizeStart($event)
      "
    />
  </div>
</template>

<style scoped>
.treeview-container {
  position: absolute;
  z-index: 2;
  left: 0;
  top: 0;
  height: calc(100vh - 100px);
  margin-top: 10px;
  margin-left: 10px;
  pointer-events: auto;
  width: max-content;
  min-width: min-content;
}

.layout-root {
  display: flex;
  height: 100%;
}

.column {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
  flex-shrink: 0;
}

.main-column {
  flex-shrink: 0;
}

.additional-column {
  flex-shrink: 0;
}

.view-wrapper {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 2px;
  transition: transform 0.2s;
  min-height: 150px;
}

.view-wrapper.drag-over {
  border: 2px dashed rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  background-color: rgba(0, 0, 0, 0.02);
}

.column-separator {
  width: 6px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  margin: 0 2px;
  cursor: ew-resize;
  position: relative;
}

.column-separator:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

.column-separator::after {
  content: "";
  position: absolute;
  top: 10%;
  bottom: 10%;
  left: 2px;
  width: 2px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 1px;
}

.v-split-resizer {
  height: 6px;
  position: relative;
  cursor: ns-resize;
  background-color: transparent;
  z-index: 5;
}

.v-split-resizer::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 10%;
  right: 10%;
  height: 2px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 1px;
  transition: background-color 0.2s;
}

.v-split-resizer:hover::after {
  background-color: rgba(0, 0, 0, 0.4);
  height: 3px;
  top: 1.5px;
}

.total-resizer {
  position: absolute;
  top: 0;
  right: -3px;
  width: 8px;
  height: 100%;
  cursor: ew-resize;
  z-index: 10;
}

.total-resizer:hover {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>
