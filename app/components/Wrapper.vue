<template>
  <v-container>
    <v-row class="flex-column">
      <template v-if="!infra_store.microservices_connected">
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

<script setup>
  import Launcher from "./Launcher.vue"
  import PackagesVersions from "./PackagesVersions.vue"
  import Stepper from "./Stepper.vue"

  const infra_store = useInfraStore()

  const props = defineProps({
    versions_schema: { type: Object, required: true },
  })
  const { versions_schema } = props
</script>
