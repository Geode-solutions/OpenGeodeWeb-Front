<script setup lang="ts">
import type { ComponentRelations } from "@ogw_front/stores/data_helpers/relations";
import type { FormattedComponent } from "@ogw_front/stores/data_helpers/mesh";
import { MESH_COMPONENT_TYPES } from "@ogw_front/utils/default_styles";
import { pluralize } from "@ogw_front/utils/string";
import { useDataStore } from "@ogw_front/stores/data";

interface Props {
  modelId: string;
  componentId: string;
}

const { modelId, componentId } = defineProps<Props>();

const dataStore = useDataStore();
const relations = ref<ComponentRelations | undefined>(undefined);

watch(
  () => [modelId, componentId] as const,
  async ([newModelId, newComponentId]) => {
    relations.value = await dataStore.getComponentRelations(newModelId, newComponentId);
  },
  { immediate: true },
);

function summarize(components: readonly FormattedComponent[]): string {
  const counts = new Map<string, number>();
  for (const component of components) {
    counts.set(component.category, (counts.get(component.category) ?? 0) + 1);
  }
  return MESH_COMPONENT_TYPES.filter((type) => counts.has(type))
    .map((type) => {
      const count = counts.get(type) ?? 0;
      return `${count} ${count > 1 ? pluralize(type) : type}`;
    })
    .join(", ");
}

const rows = computed<{ label: string; summary: string; testId: string }[]>(() => {
  if (!relations.value) {
    return [];
  }
  return [
    { label: "Boundaries", summary: summarize(relations.value.boundaries), testId: "boundaries" },
    { label: "Internals", summary: summarize(relations.value.internals), testId: "internals" },
  ].filter((row) => row.summary !== "");
});
</script>

<template>
  <div v-if="rows.length > 0" class="d-flex flex-column ga-1">
    <span v-for="row in rows" :key="row.label" class="text-caption d-flex align-center">
      <strong class="text-white mr-1">{{ row.label }}:</strong>
      <span :data-testid="`relations-${row.testId}`">{{ row.summary }}</span>
    </span>
  </div>
</template>
