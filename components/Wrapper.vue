<template>
  <v-container>
    <v-row class="flex-column">
      <v-col>
        <Header :tool_name="tool_name" :cards_list="cards_list" />
      </v-col>
      <v-col v-if="!cloud_store.is_running">
        <Launcher />
      </v-col>
      <v-col v-if="cloud_store.is_running">
        <Stepper />
      </v-col>
      <v-col v-if="cloud_store.is_running">
        <PackagesVersions :route_prefix="route_prefix" />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
const cloud_store = use_cloud_store()

const props = defineProps({
  cards_list: { type: Array, required: true },
})
const { cards_list } = props

const stepper_tree = inject('stepper_tree')
const { tool_name, route_prefix } = stepper_tree
</script>
