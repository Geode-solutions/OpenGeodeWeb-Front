<script setup lang="ts">
import type { ModelTabItem } from "@ogw_front/composables/model_tabs";

interface Props {
  tabs: ModelTabItem[];
}

const { tabs } = defineProps<Props>();
const activeTab = defineModel<string>({ required: true });
</script>

<template>
  <v-row v-if="tabs.length > 0" justify="center" dense class="mb-2">
    <v-col cols="12" class="py-0 d-flex justify-center">
      <v-btn-toggle
        v-model="activeTab"
        mandatory
        color="primary"
        variant="outlined"
        density="compact"
      >
        <v-btn
          v-for="tab in tabs"
          :key="tab.value"
          :value="tab.value"
          :data-testid="tab.testId"
          size="small"
          class="text-caption text-none"
        >
          {{ tab.label }}
        </v-btn>
      </v-btn-toggle>
    </v-col>
  </v-row>
</template>
