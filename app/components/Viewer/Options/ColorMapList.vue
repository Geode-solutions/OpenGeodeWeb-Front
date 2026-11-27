<script setup lang="ts">
import type { AttributeColorMap } from "@ogw_front/types/attribute";
import type { ColorMapPreset } from "@ogw_front/types/props/viewer/options";
import GlassCard from "@ogw_front/components/GlassCard.vue";
import type { SearchQuery } from "@ogw_front/types/ui";
import { drawCanvasForPreset } from "@ogw_front/utils/colormap";

// A canvas of the color map list, by the id of the row that draws it
type ColorMapCanvasId = string;

// A canvas of the color map list, with the preset it draws
interface ColorMapCanvasEntry {
  element: HTMLCanvasElement;
  presetName: AttributeColorMap;
}

// A position in the canvases the color map list draws chunk by chunk
type ColorMapCanvasIndex = number;

// A drawing pass of the color map list canvases, the latest one cancelling the earlier ones
type ColorMapRenderJobId = number;

interface Props {
  presets: readonly ColorMapPreset[];
  selectedPresetName: AttributeColorMap;
}

interface Emits {
  select: [preset: ColorMapPreset];
}

const CHUNK_SIZE = 5;

const { presets, selectedPresetName } = defineProps<Props>();

const emit = defineEmits<Emits>();

const filterText = ref<SearchQuery>("");
const canvasRefs = ref<Map<ColorMapCanvasId, ColorMapCanvasEntry>>(new Map());
const loading = ref<boolean>(true);
const renderJobId = ref<ColorMapRenderJobId>(0);
const openedGroups = ref<AttributeColorMap[]>([]);

function setCanvasRef(
  presetName: AttributeColorMap,
  element: Element | null,
  id: ColorMapCanvasId,
): void {
  if (element) {
    canvasRefs.value.set(id, {
      element: element as HTMLCanvasElement,
      presetName,
    });
  } else {
    canvasRefs.value.delete(id);
  }
}

const filteredPresets = computed<readonly ColorMapPreset[]>(() => {
  const allPresets = presets;
  if (!filterText.value) {
    return allPresets;
  }
  const term = filterText.value.toLowerCase();

  const result: ColorMapPreset[] = [];
  for (const item of allPresets) {
    if (item.Children) {
      const children = item.Children.filter((child) => child.Name.toLowerCase().includes(term));
      if (children.length > 0) {
        result.push({ ...item, Children: children });
      }
    } else if (item.Name.toLowerCase().includes(term)) {
      result.push(item);
    }
  }
  return result;
});

watch(filterText, (newFilterText) => {
  if (newFilterText) {
    openedGroups.value = filteredPresets.value
      .filter((item) => item.Children)
      .map((item) => item.Name);
  } else {
    openedGroups.value = [];
  }
});

function processChunk(
  entries: [ColorMapCanvasId, ColorMapCanvasEntry][],
  index: ColorMapCanvasIndex,
  jobId: ColorMapRenderJobId,
): void {
  if (jobId !== renderJobId.value || index >= entries.length) {
    if (jobId === renderJobId.value) {
      loading.value = false;
    }
    return;
  }

  const end = Math.min(index + CHUNK_SIZE, entries.length);
  for (let i = index; i < end; i += 1) {
    const entry = entries[i];
    if (!entry) {
      continue;
    }
    const [, refValue] = entry;
    drawCanvasForPreset(refValue.presetName, refValue.element);
  }
  const ZERO = 0;
  setTimeout(() => processChunk(entries, end, jobId), ZERO);
}

function drawAllCanvases(): void {
  renderJobId.value += 1;
  const jobId = renderJobId.value;
  loading.value = true;
  nextTick(() => {
    const WAIT_MS = 50;
    setTimeout(() => processChunk([...canvasRefs.value.entries()], 0, jobId), WAIT_MS);
  });
}

onMounted(drawAllCanvases);
watch(filteredPresets, drawAllCanvases);
</script>

<template>
  <GlassCard width="320" variant="panel" padding="pa-3" rounded="lg" class="overflow-hidden">
    <v-overlay
      v-if="loading"
      data-testid="colorMapListLoading"
      contained
      persistent
      class="align-center justify-center"
      scrim="surface"
      opacity="0.6"
    >
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>
    <v-text-field
      v-model="filterText"
      data-testid="colorMapListFilter"
      placeholder="Search presets..."
      density="compact"
      hide-details
      prepend-inner-icon="ph-magnifying-glass"
      variant="solo-filled"
      flat
      class="mb-3"
    />

    <v-list
      v-model:opened="openedGroups"
      data-testid="colorMapList"
      density="compact"
      max-height="350"
      bg-color="transparent"
      class="pa-0"
      :style="{ opacity: loading ? '0.3' : '1', transition: 'opacity 0.2s' }"
    >
      <template v-for="(item, itemIdx) in filteredPresets" :key="item.Name">
        <v-list-group v-if="item.Children" :value="item.Name">
          <template #activator="{ props: gProps }">
            <v-list-item v-bind="gProps" :title="item.Name" class="font-weight-bold" />
          </template>

          <v-list-item
            v-for="(child, childIdx) in item.Children"
            :key="child.Name"
            :active="child.Name === selectedPresetName"
            @click="emit('select', child)"
            class="px-2 mb-1"
            rounded="md"
          >
            <div class="d-flex flex-column py-1">
              <span class="text-caption text-medium-emphasis mb-1">{{ child.Name }}</span>
              <canvas
                :ref="
                  (element: Element | null) =>
                    setCanvasRef(child.Name, element, `g-${itemIdx}-${childIdx}`)
                "
                width="200"
                height="18"
                class="w-100 rounded-xs border-thin"
              />
            </div>
          </v-list-item>
        </v-list-group>

        <v-list-item
          v-else
          :active="item.Name === selectedPresetName"
          color="primary"
          @click="emit('select', item)"
          class="px-2 mb-1"
          rounded="md"
        >
          <div class="d-flex flex-column py-1">
            <span class="text-caption text-medium-emphasis mb-1">{{ item.Name }}</span>
            <canvas
              :ref="(element: Element | null) => setCanvasRef(item.Name, element, `s-${itemIdx}`)"
              width="200"
              height="18"
              class="w-100 rounded-xs border-thin"
            />
          </div>
        </v-list-item>
      </template>
    </v-list>
    <slot></slot>
  </GlassCard>
</template>

<style scoped>
.border-thin {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
}

.v-list-item {
  background-color: rgba(var(--v-theme-on-surface), 0.06) !important;
}
</style>
