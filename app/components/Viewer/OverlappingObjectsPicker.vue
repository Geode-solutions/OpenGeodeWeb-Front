<script setup>
import GlassCard from "@ogw_front/components/GlassCard";
import { formatListId } from "@ogw_front/utils/name_cleaner";
import { geode_objects } from "@ogw_front/assets/geode_objects";

const { displayIntermediate, intermediateItems, menuStyle } = defineProps({
  displayIntermediate: { type: Boolean, required: true },
  intermediateItems: { type: Array, required: true },
  menuStyle: { type: Object, required: true },
});

const emit = defineEmits(["select", "update:displayIntermediate"]);

function selectItem(item) {
  emit("select", item);
}

function handleUpdate(val) {
  emit("update:displayIntermediate", val);
}
</script>

<template>
  <v-menu
    :model-value="displayIntermediate"
    :close-on-content-click="true"
    :style="menuStyle"
    :overlay="false"
    @update:model-value="handleUpdate"
  >
    <GlassCard
      variant="panel"
      padding="pa-0"
      rounded="lg"
      class="elevation-12"
      min-width="260"
      max-width="340"
    >
      <v-card-title
        class="d-flex align-center py-2 px-3 text-caption text-uppercase font-weight-black text-medium-emphasis"
      >
        <v-icon
          icon="mdi-layers-triple"
          size="small"
          class="mr-2"
          color="secondary"
        />
        Overlapping objects
      </v-card-title>

      <v-divider />

      <v-list class="py-1 bg-transparent" density="compact">
        <v-list-item
          v-for="item in intermediateItems"
          :key="`${item.id}-${item.viewer_id}`"
          class="intermediate-picker-item px-3 py-2"
          @click="selectItem(item)"
        >
          <template #prepend>
            <v-img
              v-if="geode_objects[item.geode_object_type]?.image"
              :src="geode_objects[item.geode_object_type].image"
              height="24"
              width="24"
              max-width="24"
              class="mr-3"
              style="object-fit: contain; filter: brightness(0) invert(1)"
            />
            <v-icon
              v-else
              icon="mdi-cube-outline"
              size="24"
              color="white"
              class="mr-3"
            />
          </template>

          <v-list-item-title
            class="font-weight-bold text-body-2 text-truncate text-white"
          >
            {{ item.name }}
          </v-list-item-title>
          <v-list-item-subtitle
            class="text-caption text-truncate text-medium-emphasis mt-0.5 d-flex align-center"
          >
            <span class="font-weight-medium mr-1">{{
              item.geode_object_type
            }}</span>
            <span
              style="font-family: monospace; opacity: 0.65; font-size: 0.72rem"
              >&middot; {{ formatListId(item.id) }}</span
            >
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </GlassCard>
  </v-menu>
</template>

<style scoped>
.intermediate-picker-item {
  transition: all 0.2s ease;
  border-radius: 8px !important;
  margin: 2px 6px;
}

.intermediate-picker-item:hover {
  background: rgba(var(--v-theme-secondary), 0.1) !important;
  transform: translateX(4px);
}
</style>
