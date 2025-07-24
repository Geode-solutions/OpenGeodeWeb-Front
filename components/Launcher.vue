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
        <h4 class="pb-3">Please complete the recaptcha to launch the app</h4>
        <Recaptcha :site_key="site_key" />
      </v-col>
      <v-col v-else-if="infra_store.status == Status.CREATING">
        <Loading />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import Status from "@ogw_f/utils/status.js"

  const infra_store = use_infra_store()
  const site_key = useRuntimeConfig().public.RECAPTCHA_SITE_KEY

  if (import.meta.client) {
    if (infra_store.is_captcha_validated) {
      infra_store.create_backend()
    }
  }
  watch(
    () => infra_store.is_captcha_validated,
    (value, oldValue) => {
      if (value && !oldValue && import.meta.client) {
        infra_store.create_backend()
      }
    },
  )
</script>
