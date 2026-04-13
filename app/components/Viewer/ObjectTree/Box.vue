<script setup>
const props = defineProps({
  title: { type: String, required: true },
  closable: { type: Boolean, default: false },
});

const emit = defineEmits(["close"]);
</script>

<template>
  <v-card variant="outlined" class="tree-box d-flex flex-column">
    <v-card-title
      class="tree-box-header pa-2 d-flex align-center"
      :class="{ 'cursor-grab': closable }"
      :draggable="closable"
      @dragstart="emit('dragstart', $event)"
    >
      <v-icon v-if="closable" size="small" class="mr-2">mdi-drag-variant</v-icon>
      <span class="text-subtitle-2 font-weight-bold">{{ title }}</span>
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
  border-radius: 8px;
  background-color: transparent !important;
  backdrop-filter: blur(2px);
  border: 1px solid rgba(0, 0, 0, 0.2);
}

.tree-box-header {
  min-height: 40px;
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
