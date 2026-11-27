<script setup lang="ts">
import type { Pixels } from "@ogw_front/types/ui";
import ToolPanel from "@ogw_front/components/ToolPanel.vue";
import type { ZScale } from "@ogw_front/types/geometry";

interface Props {
  width: Pixels;
  escapeFunction: () => void;
}

interface Emits {
  apply: [];
}

const zScale = defineModel<ZScale>({ default: 1 });
const show = defineModel<boolean>("show", { default: false });

const { width, escapeFunction } = defineProps<Props>();

const emit = defineEmits<Emits>();

function apply(): void {
  emit("apply");
  show.value = false;
}
</script>

<template>
  <ToolPanel
    v-model="show"
    title="Z Scaling Control"
    :width="width"
    action-label="Apply"
    :escapeFunction="escapeFunction"
    @action="apply"
  >
    <v-container class="pa-3 py-1">
      <v-row dense>
        <!-- ToolPanel clips its content: leave room above the slider for its thumb label -->
        <v-col cols="12" class="pt-7 pb-1">
          <v-slider
            v-model="zScale"
            :min="1"
            :max="10"
            :step="0.2"
            label="Z Scale"
            density="compact"
            hide-details
            thumb-label
            class="text-caption"
          />
        </v-col>
      </v-row>
      <v-row dense>
        <v-col cols="12" class="py-1">
          <v-text-field
            v-model.number="zScale"
            type="number"
            label="Z Scale Value"
            data-testid="zScaleInput"
            variant="outlined"
            density="compact"
            hide-details
            step="0.1"
            :min="1"
            class="text-caption"
          />
        </v-col>
      </v-row>
    </v-container>
  </ToolPanel>
</template>
