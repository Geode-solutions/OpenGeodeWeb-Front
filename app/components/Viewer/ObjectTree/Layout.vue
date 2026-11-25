<script setup lang="ts">
import GlobalObjects from "@ogw_front/components/Viewer/ObjectTree/Views/GlobalObjects.vue";
import ModelTree from "@ogw_front/components/Viewer/ObjectTree/Views/ModelTree.vue";
import type { TreeMenuPayload } from "@ogw_front/utils/treeview";
import ViewerObjectTreeBox from "@ogw_front/components/Viewer/ObjectTree/Box.vue";
import { geodeObjectImage } from "@ogw_front/assets/geode_objects";
import { useAdaptiveStyles } from "@ogw_front/composables/use_adaptive_styles";
import { useModelHeaderHover } from "@ogw_front/composables/model_header_hover";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

const WIDTH_MIN = 100;
const HEIGHT_MIN = 150;
const GAP_WIDTH = 0;
const PERCENT_100 = 100;

const TOTAL_PERCENT = 100;
const MAX_PANEL_WIDTH_RATIO = 0.8;
const AUTO_CLOSE_THRESHOLD = 80;
// Apps can align the panels on their own shape system (fallbacks: the former look)
const PANEL_RADIUS = "var(--ogw-viewer-panel-radius, 16px)";

interface Props {
  containerWidth: number;
}

const { containerWidth } = defineProps<Props>();

const treeviewStore = useTreeviewStore();
const { onModelHeaderEnter, onModelHeaderLeave } = useModelHeaderHover();

interface Emits {
  "show-menu": [payload: TreeMenuPayload];
}

const emit = defineEmits<Emits>();

const activityBar = useTemplateRef("activity-bar");
const { adaptiveStyles: activityBarAdaptiveStyles } = useAdaptiveStyles(activityBar);

const maxWidth = computed<number>(() => containerWidth * MAX_PANEL_WIDTH_RATIO);

const mainView = computed(() => treeviewStore.opened_views.find((view) => view.id === "main"));
const additionalViews = computed(() =>
  treeviewStore.opened_views.filter((view) => view.id !== "main"),
);
// The model trees not collapsed in the activity bar
const shownViews = computed(() => additionalViews.value.filter((view) => view.collapsed !== true));

const totalWidth = computed<string>(() => {
  const hasAdditional = shownViews.value.length > 0;
  const hasMain = Boolean(mainView.value);
  const gap = hasAdditional && hasMain ? GAP_WIDTH : 0;
  const firstColWidth = hasMain ? treeviewStore.panelWidth : 0;
  const secondColWidth = hasAdditional ? treeviewStore.additionalPanelWidth : 0;
  return `${firstColWidth + secondColWidth + gap}px`;
});

const rowHeights = computed<number[]>({
  get: () => treeviewStore.rowHeights,
  set: (val) => treeviewStore.setRowHeights(val),
});
const draggedId = ref<string | undefined>(undefined);

watch(
  () => shownViews.value.length,
  (newLength) => {
    if (newLength > 0 && rowHeights.value.length !== newLength) {
      treeviewStore.setRowHeights(Array.from({ length: newLength }, () => PERCENT_100 / newLength));
    }
  },
  { immediate: true },
);

watch([maxWidth, (): number => shownViews.value.length], ([newMax]): void => {
  const hasAdditional = shownViews.value.length > 0;
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

function modelGeodeId(modelId: string): string | undefined {
  for (const group of treeviewStore.items) {
    const child = group.children.find((item) => item.id === modelId);
    if (child) {
      return child.geode_id;
    }
  }
  return undefined;
}

function viewIndex(id: string): number {
  return treeviewStore.opened_views.findIndex((view) => view.id === id);
}

function onDragStart(id: string): void {
  draggedId.value = id;
}

function onDragOver(event: DragEvent): void {
  event.preventDefault();
}

function onDrop(targetId: string): void {
  if (draggedId.value !== undefined && draggedId.value !== targetId) {
    treeviewStore.moveView(viewIndex(draggedId.value), viewIndex(targetId));
  }
  draggedId.value = undefined;
}

function onResizeStart(event: MouseEvent): void {
  const startWidth = treeviewStore.panelWidth;
  const startX = event.clientX;
  function resize(move_event: MouseEvent): void {
    const deltaX = move_event.clientX - startX;
    let newWidth = startWidth + deltaX;
    const hasAdditional = shownViews.value.length > 0;
    const gap = hasAdditional ? GAP_WIDTH : 0;
    const currentTotalWidth =
      newWidth + (hasAdditional ? treeviewStore.additionalPanelWidth : 0) + gap;
    if (currentTotalWidth > maxWidth.value) {
      newWidth = maxWidth.value - (hasAdditional ? treeviewStore.additionalPanelWidth : 0) - gap;
    }

    if (newWidth < AUTO_CLOSE_THRESHOLD) {
      treeviewStore.closeView("main");
      return;
    }

    treeviewStore.setPanelWidth(Math.max(WIDTH_MIN, newWidth));
    document.body.style.userSelect = "none";
  }
  function stopResize(): void {
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
    document.body.style.userSelect = "";
  }
  document.addEventListener("mousemove", resize);
  document.addEventListener("mouseup", stopResize);
}

function onAdditionalResizeStart(event: MouseEvent): void {
  const startWidth = treeviewStore.additionalPanelWidth;
  const startX = event.clientX;
  function resize(move_event: MouseEvent): void {
    const deltaX = move_event.clientX - startX;
    const newWidth = startWidth + deltaX;
    const currentTotalWidth = treeviewStore.panelWidth + newWidth + GAP_WIDTH;
    if (newWidth < AUTO_CLOSE_THRESHOLD) {
      const lastShownView = shownViews.value.at(-1);
      if (lastShownView) {
        treeviewStore.toggleCollapsed(lastShownView.id);
      }
      return;
    }

    treeviewStore.setAdditionalPanelWidth(Math.max(WIDTH_MIN, newWidth));
    document.body.style.userSelect = "none";
  }
  function stopResize(): void {
    document.removeEventListener("mousemove", resize);
    document.removeEventListener("mouseup", stopResize);
    document.body.style.userSelect = "";
  }
  document.addEventListener("mousemove", resize);
  document.addEventListener("mouseup", stopResize);
}

function onVerticalResizeStart(event: MouseEvent, index: number): void {
  const startY = event.clientY;
  const startHeight1 = rowHeights.value[index] ?? 0;
  const startHeight2 = rowHeights.value[index + 1] ?? 0;
  const containerHeight = (event.currentTarget as HTMLElement).parentElement?.offsetHeight ?? 0;

  function resize(move_event: MouseEvent): void {
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

  function stopResize(): void {
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
    v-if="treeviewStore.items.length > 0 || treeviewStore.pendingImports.length > 0"
    class="treeview-layout d-flex"
    @contextmenu.prevent
    @mousedown.stop
  >
    <div
      ref="activity-bar"
      class="activity-bar d-flex flex-column align-center py-2"
      :class="{ 'is-closed': !mainView && shownViews.length === 0 }"
      :style="activityBarAdaptiveStyles"
    >
      <v-btn
        data-testid="toggleObjectsButton"
        icon="ph-tree-structure"
        variant="text"
        :color="mainView ? 'primary' : undefined"
        class="mb-2"
        v-tooltip="'Toggle Objects'"
        @click="treeviewStore.toggleView('main')"
      />
      <template v-if="additionalViews.length > 0">
        <div class="activity-bar-separator" />
        <div
          v-for="view in additionalViews"
          :key="view.id"
          class="model-tree-toggle"
          :class="{ 'is-collapsed': view.collapsed === true }"
          :style="view.color ? { '--model-tree-color': view.color } : undefined"
        >
          <v-btn
            data-testid="toggleModelTreeButton"
            icon
            variant="text"
            density="comfortable"
            v-tooltip="view.collapsed === true ? `Show ${view.title}` : `Collapse ${view.title}`"
            @click="treeviewStore.toggleCollapsed(view.id)"
            @mouseenter="onModelHeaderEnter(view.id)"
            @mouseleave="onModelHeaderLeave(view.id)"
          >
            <v-img
              v-if="view.geode_object_type"
              :src="geodeObjectImage(view.geode_object_type)"
              width="22"
              height="22"
              class="model-tree-toggle-icon"
            />
            <v-icon v-else size="22">ph-cube</v-icon>
          </v-btn>
        </div>
      </template>
    </div>

    <div class="treeview-container d-flex" :style="{ width: totalWidth }">
      <div
        v-if="mainView"
        class="column main-column"
        :style="{
          width: `${treeviewStore.panelWidth}px`,
        }"
      >
        <ViewerObjectTreeBox
          :title="mainView?.title || 'Objects'"
          font-icon="ph-tree-structure"
          :scroll-top="mainView?.scrollTop || 0"
          closable
          :border-radius="shownViews.length > 0 ? '0' : `0 ${PANEL_RADIUS} ${PANEL_RADIUS} 0`"
          :border-left="false"
          @close="treeviewStore.closeView('main')"
          @update:scroll-top="mainView && treeviewStore.setScrollTop(mainView.id, $event)"
        >
          <GlobalObjects data-testid="mainObjectTree" @show-menu="emit('show-menu', $event)" />
        </ViewerObjectTreeBox>
      </div>

      <div
        v-if="mainView && shownViews.length > 0"
        class="column-separator"
        @mousedown="onResizeStart"
      />

      <div
        v-if="shownViews.length > 0"
        class="column additional-column"
        :style="{
          width: `${treeviewStore.additionalPanelWidth}px`,
        }"
      >
        <template v-for="(view, index) in shownViews" :key="view.id">
          <div
            class="view-wrapper"
            :class="{
              'drag-over': draggedId !== undefined && draggedId !== view.id,
            }"
            :style="{ flex: `0 0 ${rowHeights[index]}%` }"
            @dragover="onDragOver"
            @drop="onDrop(view.id)"
          >
            <ViewerObjectTreeBox
              :title="view.title"
              :icon="view.geode_object_type ? geodeObjectImage(view.geode_object_type) : undefined"
              :scroll-top="view.scrollTop"
              closable
              :border-radius="`0 ${index === 0 ? PANEL_RADIUS : '0'} ${index === shownViews.length - 1 ? PANEL_RADIUS : '0'} 0`"
              :border-left="false"
              :accent="
                view.color
                  ? { color: view.color, highlighted: treeviewStore.hoveredModelId === view.id }
                  : undefined
              "
              @close="treeviewStore.closeView(view.id)"
              @dragstart="onDragStart(view.id)"
              @update:scroll-top="treeviewStore.setScrollTop(view.id, $event)"
              @header-enter="onModelHeaderEnter(view.id)"
              @header-leave="onModelHeaderLeave(view.id)"
            >
              <template #tooltip>
                <div data-testid="modelTreeTooltip" class="d-flex flex-column ga-1 text-caption">
                  <span><strong class="mr-1">Name:</strong>{{ view.title }}</span>
                  <span v-if="view.geode_object_type">
                    <strong class="mr-1">Type:</strong>{{ view.geode_object_type }}
                  </span>
                  <span v-if="modelGeodeId(view.id)">
                    <strong class="mr-1">ID:</strong>{{ modelGeodeId(view.id) }}
                  </span>
                </div>
              </template>
              <ModelTree
                data-testid="modelComponentsObjectTree"
                :id="view.id"
                @show-menu="emit('show-menu', $event)"
              />
            </ViewerObjectTreeBox>
          </div>
          <div
            v-if="index < shownViews.length - 1"
            class="v-split-resizer"
            @mousedown="onVerticalResizeStart($event, index)"
          />
        </template>
      </div>
      <div
        v-if="mainView || shownViews.length > 0"
        class="total-resizer"
        @mousedown="
          shownViews.length > 0
            ? onAdditionalResizeStart($event)
            : mainView
              ? onResizeStart($event)
              : undefined
        "
      />
    </div>
  </div>
</template>

<style scoped>
.treeview-layout {
  position: absolute;
  z-index: 1;
  left: 0;
  top: var(--ogw-viewer-panel-inset, 8px);
  height: calc(100% - 2 * var(--ogw-viewer-panel-inset, 8px));
  pointer-events: auto;
}

.activity-bar {
  width: 48px;
  height: 100%;
  border-radius: var(--ogw-viewer-panel-radius, 16px) 0 0 var(--ogw-viewer-panel-radius, 16px);
  margin-left: var(--ogw-viewer-panel-inset, 10px);
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-right: none;
  box-shadow: 0 4px 15px rgba(var(--v-theme-on-surface), 0.05);
  position: relative;
  overflow: hidden;
  transition:
    background-color 0.3s ease,
    backdrop-filter 0.3s ease,
    border-radius 0.2s ease;
}

.activity-bar.is-closed {
  border-radius: var(--ogw-viewer-panel-radius, 16px);
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.activity-bar::before {
  content: "";
  position: absolute;
  inset: 0;
  /* Adaptive glass: apps can tint it (an "r, g, b" triplet), change its blending and set a minimum opacity, per
     theme (the radial menu's one) */
  background: rgba(
    var(--ogw-viewer-glass-tint, 255, 255, 255),
    max(var(--adaptive-opacity), var(--ogw-viewer-glass-min-opacity, 0))
  );
  /* Apps can replace the adaptive blur and dimming of the backdrop, "none" keeps it sharp */
  backdrop-filter: var(
    --ogw-viewer-glass-backdrop,
    blur(var(--adaptive-blur)) brightness(var(--adaptive-brightness))
  );
  -webkit-backdrop-filter: var(
    --ogw-viewer-glass-backdrop,
    blur(var(--adaptive-blur)) brightness(var(--adaptive-brightness))
  );
  mix-blend-mode: var(--ogw-viewer-glass-blend, lighten);
  z-index: 0;
  pointer-events: none;
  border-radius: inherit;
  transition:
    background-color 0.3s ease,
    backdrop-filter 0.3s ease;
}

.activity-bar > * {
  position: relative;
  z-index: 1;
}

.activity-bar-separator {
  width: 24px;
  height: 1px;
  margin-bottom: 6px;
  flex-shrink: 0;
  background-color: rgba(var(--v-border-color), var(--v-border-opacity));
}

/* A model tree button: the model type icon, marked with the color of its tree, faded while collapsed */
.model-tree-toggle {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 2px;
}

.model-tree-toggle::before {
  content: "";
  position: absolute;
  left: 0;
  top: 10px;
  bottom: 10px;
  width: 3px;
  border-radius: 0 2px 2px 0;
  background-color: var(--model-tree-color, transparent);
}

.model-tree-toggle .v-btn {
  background-color: rgba(var(--v-theme-on-surface), 0.08);
}

.model-tree-toggle.is-collapsed::before {
  opacity: 0.5;
}

.model-tree-toggle.is-collapsed .v-btn {
  background-color: transparent;
}

.model-tree-toggle.is-collapsed :deep(.v-btn__content) {
  opacity: 0.55;
}

.model-tree-toggle-icon {
  flex: 0 0 auto;
  filter: var(--ogw-mono-icon-filter, brightness(0));
}

.treeview-container {
  height: 100%;
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
  transition: transform 0.2s;
  min-height: 150px;
}

.view-wrapper.drag-over {
  border: 2px dashed rgba(var(--v-theme-on-surface), 0.2);
  border-radius: var(--ogw-viewer-panel-radius, 16px);
  background-color: rgba(var(--v-theme-on-surface), 0.02);
}

.column-separator {
  width: 6px;
  background-color: rgba(var(--v-theme-on-surface), 0.05);
  border-radius: 3px;
  margin: 0 2px;
  cursor: ew-resize;
  position: relative;
}

.column-separator:hover {
  background-color: rgba(var(--v-theme-on-surface), 0.2);
}

.column-separator::after {
  content: "";
  position: absolute;
  top: 10%;
  bottom: 10%;
  left: 2px;
  width: 2px;
  background-color: rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 1px;
}

.v-split-resizer {
  height: 6px;
  position: relative;
  cursor: ns-resize;
  background-color: transparent;
  z-index: 1;
}

.v-split-resizer::after {
  content: "";
  position: absolute;
  top: 2px;
  left: 10%;
  right: 10%;
  height: 2px;
  background-color: rgba(var(--v-theme-on-surface), 0.1);
  border-radius: 1px;
  transition: background-color 0.2s;
}

.v-split-resizer:hover::after {
  background-color: rgba(var(--v-theme-on-surface), 0.4);
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
  z-index: 2;
}

.total-resizer:hover {
  background-color: transparent;
}
</style>
