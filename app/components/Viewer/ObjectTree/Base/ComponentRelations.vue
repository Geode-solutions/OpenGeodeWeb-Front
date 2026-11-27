<script setup lang="ts">
import type { Count, DisplayText, Label, TestId } from "@ogw_front/types/ui";
import type { ModelComponentId, ModelId } from "@ogw_front/types/identifiers";
import type { ComponentRelations } from "@ogw_internal/stores/data/model/relations";
import type { FormattedComponent } from "@ogw_internal/stores/data/model/mesh_components";
import { MESH_COMPONENT_TYPES } from "@ogw_front/utils/default_styles";
import type { ModelComponentType } from "@ogw_front/types/model";
import { pluralize } from "@ogw_front/utils/string";
import { useDataStore } from "@ogw_front/stores/data";

interface Props {
  modelId: ModelId;
  componentId: ModelComponentId;
}

// A line of the relations of a component: its relation and a count of the related components per type
interface ComponentRelationsRow {
  label: Label;
  summary: DisplayText;
  testId: TestId;
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

function summarize(components: readonly FormattedComponent[]): DisplayText {
  const counts = new Map<ModelComponentType, Count>();
  for (const component of components) {
    counts.set(component.category, (counts.get(component.category) ?? 0) + 1);
  }
  return MESH_COMPONENT_TYPES.filter((type) => counts.has(type))
    .map((type) => {
      const count = counts.get(type) ?? 0;
      if (count > 1) {
        return `${count} ${pluralize(type)}`;
      }
      return `${count} ${type}`;
    })
    .join(", ");
}

const rows = computed<ComponentRelationsRow[]>(() => {
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
      <strong class="mr-1">{{ row.label }}:</strong>
      <span :data-testid="`relations-${row.testId}`">{{ row.summary }}</span>
    </span>
  </div>
</template>
