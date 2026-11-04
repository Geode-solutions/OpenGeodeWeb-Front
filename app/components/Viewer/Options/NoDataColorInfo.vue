<script setup lang="ts">
import { DEFAULT_NO_DATA_COLOR } from "@ogw_front/utils/default_styles/constants";
import ViewerOptionsColorPicker from "@ogw_front/components/Viewer/Options/ColorPicker.vue";

const attributeNoDataColor = defineModel<typeof DEFAULT_NO_DATA_COLOR>();

const cssNoDataColor = computed<string>(() => {
  const { red, green, blue, alpha } = attributeNoDataColor.value ?? DEFAULT_NO_DATA_COLOR;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
});
</script>

<template>
  <div
    class="text-caption text-high-emphasis mt-1 d-flex align-center ga-1"
    data-testid="noDataInfo"
  >
    <v-icon icon="mdi-information-outline" size="14" color="info" />
    <span>Contains unmapped elements</span>
    <v-menu :close-on-content-click="false">
      <template #activator="{ props }">
        <button
          v-bind="props"
          type="button"
          class="color-picker-rect-btn ml-1"
          :style="{ backgroundColor: cssNoDataColor }"
          v-tooltip="'Change unmapped elements color'"
          data-testid="noDataColorBtn"
        />
      </template>
      <v-card class="pa-2">
        <ViewerOptionsColorPicker v-model="attributeNoDataColor" disabled-alpha />
      </v-card>
    </v-menu>
  </div>
</template>

<style scoped>
.color-picker-rect-btn {
  width: 26px;
  height: 15px;
  border-radius: 3px;
  border: 2px solid rgba(255, 255, 255, 0.912);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  outline: none;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}

.color-picker-rect-btn:hover {
  border-color: rgba(255, 255, 255, 0.9);
  transform: scale(1.1);
}
</style>
