<template>
  <v-container class="justify">
    <v-row align-content="center" align="center">
      <v-col
        v-if="!is_captcha_validated"
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
  import Status from "@/utils/status.js"

  const viewer_store = use_viewer_store()
  const infra_store = use_infra_store()
  const { is_captcha_validated } = storeToRefs(infra_store)

  const site_key = useRuntimeConfig().public.RECAPTCHA_SITE_KEY

  watch(is_captcha_validated, async (value) => {
    if (value === true && process.client) {
      await infra_store.create_backend()
      await viewer_store.ws_connect()
    }
  })
</script>
