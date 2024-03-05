<template>
  <ClientOnly>
    <vue-recaptcha
      ref="recaptcha"
      :sitekey="site_key"
      :load-recaptcha-script="true"
      align-self="center"
      @expired="is_captcha_validated = false"
      @verify="submit_recaptcha"
    />
  </ClientOnly>
</template>

<script setup>
  import { VueRecaptcha } from "vue-recaptcha"
  const cloud_store = use_cloud_store()
  const { is_captcha_validated } = storeToRefs(cloud_store)

  const props = defineProps({
    site_key: { type: String, required: true },
  })
  const { site_key } = props

  onMounted(() => {
    if (process.client) {
      const config = useRuntimeConfig()
      if (config.public.NODE_ENV !== "production") {
        cloud_store.$patch({ is_captcha_validated: true })
      }
    }
  })

  async function submit_recaptcha(token) {
    try {
      const response = await $fetch.raw(
        `/.netlify/functions/recaptcha?token=${token}`,
      )
      cloud_store.$patch({ is_captcha_validated: response.status == 200 })
      recaptcha.reset()
    } catch (error) {
      console.error(error)
    }
  }
</script>
