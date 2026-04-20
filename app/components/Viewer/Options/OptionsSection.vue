<script setup>
const { title } = defineProps({
  title: { type: String, required: true },
});

const isCollapsed = ref(false);
</script>

<template>
  <div class="options-section">
    <div class="section-badge" @click="isCollapsed = !isCollapsed">
      {{ title }}
      <v-icon class="collapse-icon" :class="{ rotated: isCollapsed }" size="12">
        mdi-chevron-down
      </v-icon>
    </div>
    <v-container v-show="!isCollapsed" class="pa-2">
      <slot />
    </v-container>
  </div>
</template>

<style scoped>
.options-section {
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px 8px 8px 8px;
}

.section-badge {
  position: absolute;
  top: -12px;
  left: 16px;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  padding: 2px 12px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

.section-badge:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.collapse-icon {
  transition: transform 0.2s ease;
}

.collapse-icon.rotated {
  transform: rotate(-90deg);
}

.v-theme--light .options-section {
  border-color: rgba(0, 0, 0, 0.12);
}

.v-theme--light .section-badge {
  background-color: white;
  color: #444;
  border-color: rgba(0, 0, 0, 0.12);
}
</style>
