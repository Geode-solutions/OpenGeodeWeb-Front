<template>
  <v-container justify="space-around">
    <v-row align-content="center" align="center">
      <v-col
        v-if="!is_captcha_validated"
        cols="12"
        align-self="center"
        align="center"
      >
        <h4 class="pb-3">Please complete the recaptcha to launch the app</h4>
        <!-- <Recaptcha /> -->
      </v-col>
      <v-col
        v-else-if="!cloud_store.is_running && cloud_store.is_connexion_launched"
      >
        <Loading />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
  import { VueRecaptcha } from "vue-recaptcha"
  const websocket_store = use_websocket_store()
  const cloud_store = use_cloud_store()
  const { is_captcha_validated } = storeToRefs(cloud_store)

  const site_key = useRuntimeConfig().public.RECAPTCHA_SITE_KEY

  watch(is_captcha_validated, async (value) => {
    if (value === true && process.client) {
      await cloud_store.create_connexion()
      await websocket_store.ws_connect()
    }
  })

  onMounted(() => {
    console.log("onMounted", useRuntimeConfig())
  })
</script>
