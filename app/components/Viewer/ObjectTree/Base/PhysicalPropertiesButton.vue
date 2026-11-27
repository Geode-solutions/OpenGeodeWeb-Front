<script setup lang="ts">
import type { GeodeObjectType } from "@geode/opengeodeweb-microservice/data_types";
import { physicalPropertiesViewId } from "@ogw_front/utils/treeview";
import { useDataStore } from "@ogw_front/stores/data";
import { useTreeviewStore } from "@ogw_front/stores/treeview";

interface Props {
  // The row of the model in the objects tree
  model: { id: string; title?: string; geode_object_type?: GeodeObjectType };
}

const { model } = defineProps<Props>();
const modelId = model.id;

const dataStore = useDataStore();
const treeviewStore = useTreeviewStore();
const physicalProperties = dataStore.refPhysicalProperties(modelId);

// Shown only for a model carrying physical properties
const hasPhysicalProperties = computed<boolean>(() => (physicalProperties.value?.length ?? 0) > 0);
// The color of its opened tree, the one of the model
const treeColor = computed<string | undefined>(() =>
  treeviewStore.viewColor(physicalPropertiesViewId(modelId)),
);
</script>

<template>
  <v-btn
    v-if="hasPhysicalProperties"
    data-testid="physicalPropertiesButton"
    icon
    size="medium"
    style="height: 23px; width: 23px"
    class="ml-2"
    :variant="treeColor ? 'tonal' : 'text'"
    :color="treeColor"
    v-tooltip="treeColor ? 'Close model\'s physical properties' : 'Model\'s physical properties'"
    @click.stop="
      treeviewStore.displayPhysicalPropertiesTree(modelId, model.title, model.geode_object_type)
    "
  >
    <v-icon size="18">ph-flask</v-icon>
  </v-btn>
</template>
