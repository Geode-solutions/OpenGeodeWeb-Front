<script setup>
import GlassCard from "@ogw_front/components/GlassCard";
import { middleTruncate } from "@ogw_front/utils/string";
import { useDataStore } from "@ogw_front/stores/data";
import { useMenuStore } from "@ogw_front/stores/menu";

const { show, metaData } = defineProps({
  show: { type: Boolean, required: true },
  metaData: { type: Object, required: true },
});

const emit = defineEmits(["update:show"]);

const COPIED_TIMEOUT = 1500;
const MAX_SHORT_ID_LENGTH = 15;
const ID_SLICE_START = 8;
const ID_SLICE_END_OFFSET = 7;
const TRUNCATE_MAX_LENGTH = 22;
const TRUNCATE_START_CHARS = 12;
const TRUNCATE_END_CHARS = 7;

const menuStore = useMenuStore();
const dataStore = useDataStore();

const componentItem = ref(undefined);

watch(
  () => menuStore.current_meta_data,
  async (newMeta) => {
    componentItem.value = undefined;
    if (!newMeta) {
      return;
    }

    const modelId = newMeta.modelId || newMeta.id;
    if (newMeta.pickedComponentId && modelId) {
      const components = await dataStore.getAllMeshComponents(modelId);
      componentItem.value = components.find((comp) => comp.id === newMeta.pickedComponentId);
    }
  },
  { immediate: true },
);

const cleanName = computed(() => {
  const meta = menuStore.current_meta_data;
  if (!meta) {
    return "Unnamed Object";
  }
  return meta.name || "Unnamed Object";
});

const displayTitle = computed(() => {
  const name = cleanName.value;
  if (!name) {
    return "";
  }
  return middleTruncate(name, TRUNCATE_MAX_LENGTH, TRUNCATE_START_CHARS, TRUNCATE_END_CHARS);
});

const displayComponentTitle = computed(() => {
  if (!componentItem.value) {
    return "";
  }
  return middleTruncate(
    componentItem.value.title,
    TRUNCATE_MAX_LENGTH,
    TRUNCATE_START_CHARS,
    TRUNCATE_END_CHARS,
  );
});

const copiedId = ref("");
async function copyId(targetId) {
  if (!targetId) {
    return;
  }
  try {
    await navigator.clipboard.writeText(targetId);
    copiedId.value = targetId;
    setTimeout(() => {
      copiedId.value = "";
    }, COPIED_TIMEOUT);
  } catch (error) {
    console.error("Failed to copy ID:", error);
  }
}

function formattedId(targetId) {
  if (!targetId) {
    return "";
  }
  if (targetId.length <= MAX_SHORT_ID_LENGTH) {
    return targetId;
  }
  return `${targetId.slice(0, ID_SLICE_START)}...${targetId.slice(targetId.length - ID_SLICE_END_OFFSET)}`;
}
</script>

<template>
  <v-fade-transition>
    <v-sheet v-if="show" class="object-name-popover bg-transparent" @mousedown.stop @click.stop>
      <GlassCard
        variant="panel"
        padding="pa-2 px-3"
        rounded="lg"
        class="elevation-12 text-center border-thin"
        min-width="140"
        max-width="250"
      >
        <v-row no-gutters class="flex-column align-center">
          <v-col
            class="text-subtitle-2 font-weight-bold text-truncate text-white w-100 pa-0"
            cols="auto"
            style="line-height: 1.3"
          >
            {{ displayTitle }}
          </v-col>
          <v-col
            class="text-caption font-weight-black text-uppercase text-secondary pa-0"
            style="font-size: 0.68rem; line-height: 1.2"
          >
            {{ metaData.geode_object_type }}
          </v-col>
          <v-col
            v-if="metaData.id"
            class="id-badge-container mt-1 d-inline-flex align-center px-2 py-0.5"
            @click.stop="copyId(metaData.id)"
          >
            <span class="id-text">
              {{ copiedId === metaData.id ? "COPIED!" : formattedId(metaData.id) }}
            </span>
            <v-icon
              :icon="copiedId === metaData.id ? 'mdi-check' : 'mdi-content-copy'"
              size="10"
              :color="copiedId === metaData.id ? 'success' : 'white'"
              class="ml-1"
            />
          </v-col>

          <template v-if="componentItem">
            <v-divider class="w-100 my-2" opacity="0.2" />
            <v-col
              class="text-subtitle-2 font-weight-bold text-truncate text-white w-100 pa-0"
              cols="auto"
              style="line-height: 1.3"
            >
              {{ displayComponentTitle }}
            </v-col>
            <v-col
              class="text-caption font-weight-black text-uppercase text-secondary pa-0"
              style="font-size: 0.68rem; line-height: 1.2"
            >
              {{ componentItem.category }}
            </v-col>
            <v-col
              class="id-badge-container mt-1 d-inline-flex align-center px-2 py-0.5"
              @click.stop="copyId(componentItem.id)"
            >
              <span class="id-text">
                {{
                  copiedId === componentItem.id
                    ? "COPIED!"
                    : formattedId(componentItem.id)
                }}
              </span>
              <v-icon
                :icon="copiedId === componentItem.id ? 'mdi-check' : 'mdi-content-copy'"
                size="10"
                :color="copiedId === componentItem.id ? 'success' : 'white'"
                class="ml-1"
              />
            </v-col>
          </template>
        </v-row>
      </GlassCard>
    </v-sheet>
  </v-fade-transition>
</template>

<style scoped>
.id-badge-container {
  font-family: monospace;
  font-size: 0.6rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  opacity: 0.8;
}

.id-badge-container:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.35);
  opacity: 1;
  transform: scale(1.03);
}

.id-badge-container:active {
  transform: scale(0.97);
}

.id-text {
  letter-spacing: 0.5px;
  color: rgba(255, 255, 255, 0.85);
}

.object-name-popover {
  position: absolute;
  bottom: 110px; /* Positions it beautifully above the circular menu */
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  pointer-events: auto;
}
</style>
