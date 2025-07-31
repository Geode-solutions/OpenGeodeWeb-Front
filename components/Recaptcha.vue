<template>
  <ClientOnly>
    <vue-recaptcha
      ref="recaptcha"
      :sitekey="props.site_key"
      :load-recaptcha-script="true"
      align-self="center"
      @expired="infra_store.is_captcha_validated = false"
      @verify="submit_recaptcha"
    />
  </ClientOnly>
</template>

<script setup>
  import { VueRecaptcha } from "vue-recaptcha"
  const infra_store = use_infra_store()

  const props = defineProps({
    site_key: { type: String, required: true },
  })

  onMounted(() => {
    if (import.meta.client) {
      if (
        process.env.NODE_ENV !== "production" ||
        infra_store.app_mode !== appMode.appMode.CLOUD
      ) {
        infra_store.$patch({ is_captcha_validated: true })
      }
    }
  })
  async function submit_recaptcha(token) {
    try {
      const response = await $fetch.raw(
        `/.netlify/functions/recaptcha?token=${token}`,
      )
      infra_store.$patch({ is_captcha_validated: response.status == 200 })
      recaptcha.reset()
    } catch (error) {
      console.error(error)
    }
  }
</script>
