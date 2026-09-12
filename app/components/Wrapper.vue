<script setup lang="ts">
import type { PropType } from "vue";
import Launcher from "@ogw_front/components/Launcher.vue";
import PackagesVersions from "@ogw_front/components/PackagesVersions.vue";
import Stepper from "@ogw_front/components/Stepper.vue";

import { useInfraStore } from "@ogw_front/stores/infra";
import { useStepperTree } from "@ogw_front/composables/stepper_tree";
import type { JsonRpcSchema } from "#shared/utils/types.js";

const infraStore = useInfraStore();

const { versionsSchema, appName } = defineProps({
  versionsSchema: { type: Object as PropType<JsonRpcSchema>, required: true },
  appName: { type: String, required: true },
});

// Pre-existing gap (not introduced by this typing pass): this component never
// received an actual list of import steps, so `<Stepper>` was being rendered
// without its required `stepperTree` prop and would have thrown at runtime.
// Instantiating an (empty) stepper tree here keeps the component from crashing
// without inventing step content it isn't given.
const stepperTree = useStepperTree([]);
</script>

<template>
  <v-container>
    <v-row class="flex-column">
      <template v-if="!infraStore.microservices_connected">
        <v-col>
          <Launcher :app-name="appName" />
        </v-col>
      </template>
      <template v-else>
        <v-col>
          <Stepper :stepper-tree="stepperTree" />
        </v-col>
        <v-col>
          <PackagesVersions :schema="versionsSchema" />
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>
