<script setup>
import { ref, computed, watch } from "vue";
import GlobalObjectsView from "@ogw_front/components/Viewer/ObjectTree/Views/GlobalObjectsView.vue";
import ModelComponentsView from "@ogw_front/components/Viewer/ObjectTree/Views/ModelComponentsView.vue";
import TreeBox from "@ogw_front/components/Viewer/ObjectTree/Box.vue";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

const WIDTH_MIN = 300;
const HEIGHT_MIN = 150;

const treeviewStore = useTreeviewStore();
const emit = defineEmits(["show-menu"]);

const mainView = computed(() => treeviewStore.opened_views[0]);
const additionalViews = computed(() => treeviewStore.opened_views.slice(1));

const mainColWidth = ref(50);
const rowHeights = ref([]);
const draggedIndex = ref(null);

watch(
  () => additionalViews.value.length,
  (newLength) => {
    if (newLength > 0 && rowHeights.value.length !== newLength) {
      rowHeights.value = new Array(newLength).fill(100 / newLength);
    }
  },
  { immediate: true },
);

function onDragStart(index) {
  draggedIndex.value = index;
}

function onDragOver(event) {
  event.preventDefault();
}

function onDrop(targetIndex) {
  if (draggedIndex.value !== null && draggedIndex.value !== targetIndex) {
    treeviewStore.moveView(draggedIndex.value, targetIndex);
  }
  draggedIndex.value = null;
}

function onResizeStart(event) {
  const startWidth = treeviewStore.panelWidth;
  const startX = event.clientX;
  function resize(move_event) {
    const deltaX = move_event.clientX - startX;
    const maxWidth = window.innerWidth * 0.8;
    const newWidth = Math.max(
      WIDTH_MIN,
      Math.min(startWidth + deltaX, maxWidth),
    );
    treeviewStore.setPanelWidth(newWidth);
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

function onSplitResizeStart(event) {
  const startX = event.clientX;
  const startWidth = mainColWidth.value;
  function resize(move_event) {
    const deltaX = move_event.clientX - startX;
    const deltaPercent = (deltaX / treeviewStore.panelWidth) * 100;
    mainColWidth.value = Math.max(20, Math.min(startWidth + deltaPercent, 80));
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
    const deltaPercent = (deltaY / containerHeight) * 100;

    let newH1 = startHeight1 + deltaPercent;
    let newH2 = startHeight2 - deltaPercent;

    const MIN_HEIGHT = 10;
    if (newH1 < MIN_HEIGHT) {
      newH1 = MIN_HEIGHT;
      newH2 = startHeight1 + startHeight2 - MIN_HEIGHT;
    } else if (newH2 < MIN_HEIGHT) {
      newH2 = MIN_HEIGHT;
      newH1 = startHeight1 + startHeight2 - MIN_HEIGHT;
    }

    rowHeights.value[index] = newH1;
    rowHeights.value[index + 1] = newH2;

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
    class="treeview-container"
    :style="{ width: `${treeviewStore.panelWidth}px` }"
    @contextmenu.prevent
    @mousedown.stop
  >
    <div class="layout-root">
      <div
        class="column main-column"
        :style="{
          width: additionalViews.length > 0 ? `${mainColWidth}%` : '100%',
        }"
      >
        <TreeBox :title="mainView.title">
          <GlobalObjectsView @show-menu="emit('show-menu', $event)" />
        </TreeBox>
      </div>

      <div
        v-if="additionalViews.length > 0"
        class="h-split-resizer"
        @mousedown="onSplitResizeStart"
      />

      <div v-if="additionalViews.length > 0" class="column additional-column">
        <template v-for="(view, index) in additionalViews" :key="view.id">
          <div
            class="view-wrapper"
            :class="{
              'drag-over': draggedIndex !== null && draggedIndex !== index + 1,
            }"
            :style="{ flex: `0 0 ${rowHeights[index]}%` }"
            @dragover="onDragOver"
            @drop="onDrop(index + 1)"
          >
            <TreeBox
              :title="view.title"
              :geode_object_type="view.geode_object_type"
              closable
              @close="treeviewStore.closeView(index + 1)"
              @dragstart="onDragStart(index + 1)"
            >
              <ModelComponentsView
                :id="view.id"
                @show-menu="emit('show-menu', $event)"
              />
            </TreeBox>
          </div>
          <div
            v-if="index < additionalViews.length - 1"
            class="v-split-resizer"
            @mousedown="onVerticalResizeStart($event, index)"
          />
        </template>
      </div>
    </div>
    <div class="total-resizer" @mousedown="onResizeStart" />
  </div>
</template>

<style scoped>
.treeview-container {
  position: absolute;
  z-index: 2;
  left: 0;
  top: 0;
  height: calc(100vh - 100px); /* Adjust based on your header height */
  margin-top: 10px;
  margin-left: 10px;
  pointer-events: auto;
}

.layout-root {
  display: flex;
  height: 100%;
  width: 100%;
}

.column {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.main-column {
  flex-shrink: 0;
}

.additional-column {
  flex: 1;
}

.view-wrapper {
  overflow: hidden;
  padding: 2px;
  transition: transform 0.2s;
}

.view-wrapper.drag-over {
  border: 2px dashed rgba(0, 0, 0, 0.2);
  border-radius: 16px;
  background-color: rgba(0, 0, 0, 0.02);
}

.h-split-resizer {
  width: 6px;
  position: relative;
  cursor: ew-resize;
  background-color: transparent;
  z-index: 5;
}

.h-split-resizer::after {
  content: "";
  position: absolute;
  top: 10%;
  bottom: 10%;
  left: 2px;
  width: 2px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 1px;
  transition: background-color 0.2s;
}

.h-split-resizer:hover::after {
  background-color: rgba(0, 0, 0, 0.4);
  width: 3px;
  left: 1.5px;
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
