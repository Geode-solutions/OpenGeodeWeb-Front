<script setup>
import ToolPanel from "@ogw_front/components/ToolPanel";

const zScale = defineModel({ type: Number, default: 1 });
const show = defineModel("show", { type: Boolean, default: false });

const { width } = defineProps({
  width: { type: Number, default: 260 },
});

const emit = defineEmits(["apply"]);

function apply() {
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
    @action="apply"
  >
    <v-container class="pa-3 py-1">
      <v-row dense>
        <v-col cols="12" class="py-1">
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
