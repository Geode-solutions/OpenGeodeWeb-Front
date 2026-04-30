<script setup>
import ToolPanel from "@ogw_front/components/ToolPanel";

const zScale = defineModel({ type: Number, default: 1 });
const show = defineModel("show", { type: Boolean, default: false });

const { width } = defineProps({
  width: { type: Number, default: 400 },
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
    <v-container class="pa-5">
      <v-row>
        <v-col cols="12" class="py-2">
          <v-slider v-model="zScale" :min="1" :max="10" :step="0.2" label="Z Scale" thumb-label />
        </v-col>
      </v-row>
      <v-row>
        <v-col cols="12" class="py-2">
          <v-text-field
            v-model.number="zScale"
            type="number"
            label="Z Scale Value"
            outlined
            dense
            hide-details
            step="0.1"
            :min="1"
          />
        </v-col>
      </v-row>
    </v-container>
  </ToolPanel>
</template>
