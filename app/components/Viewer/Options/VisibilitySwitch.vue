<script setup>
import BasicSwitch from "@ogw_front/components/Basic/Switch";

const visibility = defineModel();
</script>

<template>
  <v-row class="pa-0" align="center">
    <v-col cols="auto" justify="center">
      <v-icon size="30" icon="mdi-eye" v-tooltip:left="'Visibility'" />
    </v-col>
    <v-col cols="auto" justify="center">
      <BasicSwitch v-model="visibility" />
    </v-col>
  </v-row>
</template>
