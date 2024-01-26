<template>
  <v-container>
    <v-row class="flex-column">
      <v-col v-if="!is_running">
        <Launcher />
      </v-col>
      <v-col v-if="is_running">
        <Stepper />
      </v-col>
      <v-col v-if="is_running">
        <PackagesVersions :schema="versions_schema" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  const cloud_store = use_cloud_store()
  const { is_running } = storeToRefs(cloud_store)

  const props = defineProps({
    versions_schema: { type: Object, required: true },
  })
  const { versions_schema } = props
</script>
