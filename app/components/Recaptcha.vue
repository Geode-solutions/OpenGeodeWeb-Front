<template>
  <VRow align="center" justify="center" style="display: none">
    <VCol cols="4">
      <VForm v-model="valid">
        <VContainer>
          <VRow>
            <VCol>
              <VTextField v-model="name" label="Name" required />
            </VCol>
          </VRow>
          <VRow>
            <VCol>
              <VTextField
                v-model="email"
                :rules="emailRules"
                label="E-mail"
                required
              />
            </VCol>
          </VRow>
          <VRow>
            <VCol>
              <VCheckbox label="Launch the app" v-model="launch" />
            </VCol>
          </VRow>
        </VContainer>
      </VForm>
    </VCol>
  </VRow>
  <VRow align="center" justify="center">
    <VCol cols="4" class="d-flex justify-center align-center">
      <VBtn
        :text="props.button_label"
        :color="props.button_color"
        @click="submit_recaptcha"
      />
    </VCol>
  </VRow>
</template>

<script setup>
  import { appMode } from "@ogw_front/utils/app_mode"
  import { useInfraStore } from "@ogw_front/stores/infra"

  const props = defineProps({
    button_label: {
      type: String,
      required: false,
      default: "Launch the app",
    },
    button_color: {
      type: String,
      required: false,
      default: "white",
    },
  })
  const infraStore = useInfraStore()
  const name = ref("")
  const email = ref("")
  const launch = ref(false)
  const emailRules = [
    (value) => {
      if (value) {
        return true
      }
      return "E-mail is required."
    },
    (value) => {
      if (/.+@.+\..+/.test(value)) {
        return true
      }
      return "E-mail must be valid."
    },
  ]

  onMounted(() => {
    if (import.meta.client) {
      if (
        process.env.NODE_ENV !== "production" ||
        infraStore.app_mode !== appMode.CLOUD
      ) {
        infraStore.$patch({ is_captcha_validated: true })
      }
    }
  })
  async function submit_recaptcha() {
    const response = await $fetch.raw(`/.netlify/functions/recaptcha`, {
      method: "POST",
      body: {
        name: name.value,
        email: email.value,
        launch: launch.value,
      },
    })
    infraStore.$patch({
      is_captcha_validated: response.status === 200,
    })
  }
</script>
