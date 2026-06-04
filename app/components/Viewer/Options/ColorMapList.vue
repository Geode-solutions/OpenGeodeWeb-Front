<script setup>
import GlassCard from "@ogw_front/components/GlassCard.vue";
import { drawCanvasForPreset } from "@ogw_front/utils/colormap";

const CHUNK_SIZE = 5;

const { presets, selectedPresetName } = defineProps({
  presets: { type: Array, required: true },
  selectedPresetName: { type: String, default: "" },
});

const emit = defineEmits(["select"]);

const filterText = ref("");
const canvasRefs = ref({});
const loading = ref(true);
const renderJobId = ref(0);

function setCanvasRef(presetName, element, id) {
  if (element) {
    canvasRefs.value[id] = { element, presetName };
  } else {
    delete canvasRefs.value[id];
  }
}

const filteredPresets = computed(() => {
  if (!filterText.value) {
    return presets;
  }
  const term = filterText.value.toLowerCase();

  const result = [];
  for (const item of presets) {
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

function processChunk(entries, index, jobId) {
  if (jobId !== renderJobId.value || index >= entries.length) {
    if (jobId === renderJobId.value) {
      loading.value = false;
    }
    return;
  }

  const end = Math.min(index + CHUNK_SIZE, entries.length);
  for (let i = index; i < end; i += 1) {
    const [unusedKey, refValue] = entries[i];
    drawCanvasForPreset(refValue.presetName, refValue.element);
  }
  const ZERO = 0;
  setTimeout(() => processChunk(entries, end, jobId), ZERO);
}

function drawAllCanvases() {
  renderJobId.value += 1;
  const jobId = renderJobId.value;
  loading.value = true;
  nextTick(() => {
    const WAIT_MS = 50;
    setTimeout(() => processChunk(Object.entries(canvasRefs.value), 0, jobId), WAIT_MS);
  });
}

onMounted(drawAllCanvases);
watch(filteredPresets, drawAllCanvases);
</script>

<template>
  <GlassCard width="320" variant="panel" padding="pa-3" rounded="lg" class="overflow-hidden">
    <v-overlay
      v-model="loading"
      contained
      persistent
      class="align-center justify-center"
      scrim="#1e1e1e"
      opacity="0.6"
    >
      <v-progress-circular indeterminate color="primary" />
    </v-overlay>

    <v-text-field
      v-model="filterText"
      placeholder="Search presets..."
      density="compact"
      hide-details
      prepend-inner-icon="mdi-magnify"
      variant="solo-filled"
      flat
      class="mb-3"
      base-color="white"
      color="white"
    />

    <v-list
      data-testid="colorMapList"
      density="compact"
      max-height="350"
      bg-color="transparent"
      class="pa-0"
      :style="{ opacity: loading ? '0.3' : '1', transition: 'opacity 0.2s' }"
    >
      <template v-for="(item, index) in filteredPresets" :key="index">
        <v-list-group v-if="item.Children" :value="item.Name">
          <template #activator="{ props: gProps }">
            <v-list-item v-bind="gProps" :title="item.Name" class="text-white font-weight-bold" />
          </template>

          <v-list-item
            v-for="(child, childIdx) in item.Children"
            :key="childIdx"
            :active="child.Name === selectedPresetName"
            @click="emit('select', child)"
            class="px-2 mb-1"
            rounded="md"
          >
            <div class="d-flex flex-column py-1">
              <span class="text-caption text-grey-lighten-1 mb-1">{{ child.Name }}</span>
              <canvas
                :ref="(element) => setCanvasRef(child.Name, element, `g-${index}-${childIdx}`)"
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
            <span class="text-caption text-grey-lighten-1 mb-1">{{ item.Name }}</span>
            <canvas
              :ref="(element) => setCanvasRef(item.Name, element, `s-${index}`)"
              width="200"
              height="18"
              class="w-100 rounded-xs border-thin"
            />
          </div>
        </v-list-item>
      </template>
    </v-list>
  </GlassCard>
</template>

<style scoped>
.border-thin {
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
}

.v-list-item {
  background-color: rgba(255, 255, 255, 0.1) !important;
}
</style>
