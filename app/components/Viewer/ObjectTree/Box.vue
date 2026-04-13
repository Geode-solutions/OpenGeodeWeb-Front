<script setup>
import { computed } from "vue";
import { geode_objects } from "@ogw_front/assets/geode_objects";

const props = defineProps({
  title: { type: String, required: true },
  closable: { type: Boolean, default: false },
  geode_object_type: { type: String, default: "" },
  mdiIcon: { type: String, default: "" },
});

const emit = defineEmits(["close", "dragstart"]);

const icon = computed(() => {
  if (props.geode_object_type && geode_objects[props.geode_object_type]) {
    return geode_objects[props.geode_object_type].image;
  }
  return undefined;
});
</script>

<template>
  <v-card variant="outlined" class="tree-box d-flex flex-column">
    <v-card-title
      class="tree-box-header d-flex align-center"
      :class="{ 'cursor-grab': closable }"
      :draggable="closable"
      @dragstart="emit('dragstart', $event)"
    >
      <v-img
        v-if="icon"
        :src="icon"
        width="24"
        height="24"
        max-width="24"
        class="mr-2"
        style="filter: brightness(0); display: flex; align-items: center"
      />
      <v-icon v-else-if="mdiIcon" size="24" class="mr-2">{{ mdiIcon }}</v-icon>
      <v-icon v-else-if="closable" size="24" class="mr-2">mdi-drag-variant</v-icon>
      <span
        class="text-subtitle-2 font-weight-bold d-inline-flex align-center"
        style="height: 24px; line-height: 1"
      >
        {{ title }}
      </span>
      <v-spacer />
      <v-btn
        v-if="closable"
        icon="mdi-close"
        variant="text"
        size="x-small"
        @click="emit('close')"
      />
    </v-card-title>
    <v-divider />
    <v-card-text class="pa-0 flex-grow-1 overflow-y-auto overflow-x-hidden">
      <slot />
    </v-card-text>
  </v-card>
</template>

<style scoped>
.tree-box {
  height: 100%;
  border-radius: 16px;
  background-color: transparent !important;
  backdrop-filter: blur(2px);
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.tree-box-header {
  height: 40px !important;
  padding: 0 8px !important;
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
