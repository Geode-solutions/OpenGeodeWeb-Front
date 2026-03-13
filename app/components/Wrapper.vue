<script setup>
  import Launcher from "@ogw_front/components/Launcher"
  import PackagesVersions from "@ogw_front/components/PackagesVersions"
  import Stepper from "@ogw_front/components/Stepper"

  import { useInfraStore } from "@ogw_front/stores/infra"

  const infraStore = useInfraStore()

  const { versions_schema } = defineProps({
    versions_schema: { type: Object, required: true },
  })
</script>

<template>
  <v-container>
    <v-row class="flex-column">
      <template v-if="!infraStore.microservices_connected">
        <v-col>
          <Launcher />
        </v-col>
      </template>
      <template v-else>
        <v-col>
          <Stepper />
        </v-col>
        <v-col>
          <PackagesVersions :schema="versions_schema" />
        </v-col>
      </template>
    </v-row>
  </v-container>
</template>
