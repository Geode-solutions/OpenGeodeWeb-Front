<script setup lang="ts">
import type { PhysicalPropertyNode } from "@ogw_front/utils/physical_properties_tree";
import { usePhysicalPropertyColoring } from "@ogw_front/composables/physical_property_coloring";

interface Props {
  modelId: string;
  // A row of the physical properties tree: a component listed under a property carries its value
  row: { id: string; physical_value?: string };
  // The property of the row, whole even when a search hides some of its components: undefined
  // On a component row
  node: PhysicalPropertyNode | undefined;
}

const { modelId, row, node: rowNode } = defineProps<Props>();

const { isColoredBy, toggleColoring } = usePhysicalPropertyColoring(modelId);

// Defined on the row of a property with a value to color the model with
const node = computed<PhysicalPropertyNode | undefined>(() => {
  if (rowNode?.coloring === undefined) {
    return undefined;
  }
  return rowNode;
});
const active = computed<boolean>(() => node.value !== undefined && isColoredBy(node.value));
const tooltip = computed<string>(() =>
  active.value ? "Remove the coloring by this property" : "Color the model by this property",
);

async function toggle(): Promise<void> {
  if (node.value !== undefined) {
    await toggleColoring(node.value);
  }
}
</script>

<template>
  <span
    v-if="row.physical_value"
    class="text-caption text-medium-emphasis text-no-wrap me-2"
    :data-testid="'physicalValue-' + row.id"
  >
    {{ row.physical_value }}
  </span>
  <v-btn
    v-if="node"
    :icon="active ? 'ph-fill ph-palette' : 'ph-palette'"
    :color="active ? 'primary' : undefined"
    size="medium"
    variant="text"
    v-tooltip="tooltip"
    :data-testid="'physicalPropertyColoring-' + node.physical_property"
    @click.stop="toggle"
  />
</template>
