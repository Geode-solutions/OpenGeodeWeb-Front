<template>
  <v-container class="justify">
    <v-row align-content="center" align="center">
      <v-col
        v-if="!infra_store.is_captcha_validated"
        class="align"
        cols="12"
        align-self="center"
        style="z-index: 1000"
      >
        <Recaptcha :color="'secondary'" />
      </v-col>
      <v-col v-else-if="infra_store.status == Status.CREATING">
        <Loading />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import Status from "@ogw_front/utils/status.js"
  import Loading from "./Loading.vue"
  import Recaptcha from "./Recaptcha.vue"

  const infra_store = useInfraStore()

  watch(
    () => infra_store.is_captcha_validated,
    (value, oldValue) => {
      if (value && !oldValue && import.meta.client) {
        infra_store.create_backend()
      }
    },
  )
</script>
