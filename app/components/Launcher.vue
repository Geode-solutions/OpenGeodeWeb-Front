<script setup>
  import Loading from "@ogw_front/components/Loading"
  import Recaptcha from "@ogw_front/components/Recaptcha"
  import { Status } from "@ogw_front/utils/status"
  import { useInfraStore } from "@ogw_front/stores/infra"

  const infraStore = useInfraStore()
  if (infraStore.app_mode !== appMode.CLOUD) {
    infraStore.create_backend()
  }
</script>

<template>
  <v-container class="justify">
    <v-row align-content="center" align="center">
      <v-col
        v-if="!infraStore.status == Status.NOT_CREATED"
        class="align"
        cols="12"
        align-self="center"
        style="z-index: 1000"
      >
        <Recaptcha :button_color="'secondary'" />
      </v-col>
      <v-col v-else-if="infraStore.status == Status.CREATING">
        <Loading />
      </v-col>
    </v-row>
  </v-container>
</template>
