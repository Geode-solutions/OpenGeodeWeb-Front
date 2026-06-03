<script setup>
import BasicSwitch from "@ogw_front/components/Basic/Switch";

const visibility = defineModel();
</script>

<template>
  <v-row class="pa-0 px-2" align="center" no-gutters>
    <v-col cols="auto" class="mr-2">
      <v-icon size="18" icon="mdi-eye" v-tooltip:left="'Visibility'" />
    </v-col>
    <v-col cols="auto">
      <BasicSwitch v-model="visibility" />
    </v-col>
  </v-row>
</template>
