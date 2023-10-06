<template>
  <vue-recaptcha
    ref="recaptcha"
    :sitekey="site_key"
    :loadRecaptchaScript="true"
    @expired="is_captcha_validated = false"
    @verify="submit_recaptcha"
    align-self="center"
  />
</template>

<script setup>
import { VueRecaptcha } from "vue-recaptcha";

const websocket_store = use_websocket_store();
const cloud_store = use_cloud_store();
const { is_captcha_validated } = storeToRefs(cloud_store);

const site_key = useRuntimeConfig().public.RECAPTCHA_SITE_KEY;

onMounted(() => {
  if (process.client) {
    const config = useRuntimeConfig();
    if (config.public.NODE_ENV !== "production") {
      cloud_store.$patch({ is_captcha_validated: true });
    }
  }
});

async function submit_recaptcha(token) {
  try {
    const response = await $fetch.raw(
      `/.netlify/functions/recaptcha?token=${token}`
    );
    cloud_store.$patch({ is_captcha_validated: response.status == 200 });
    recaptcha.reset();
  } catch (error) {
    console.error(error);
  }
}
</script>
