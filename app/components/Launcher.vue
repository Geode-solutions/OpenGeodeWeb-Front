<script setup>
  import Status from "@ogw_front/utils/status"
  import Loading from "@ogw_front/components/Loading"
  import Recaptcha from "@ogw_front/components/Recaptcha"
  import { useInfraStore } from "@ogw_front/stores/infra"

  const infraStore = useInfraStore()

  watch(
    () => infraStore.is_captcha_validated,
    (value, oldValue) => {
      if (value && !oldValue && import.meta.client) {
        infraStore.create_backend()
      }
    },
  )
</script>

<template>
  <v-container class="justify">
    <v-row align-content="center" align="center">
      <v-col
        v-if="!infraStore.is_captcha_validated"
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
