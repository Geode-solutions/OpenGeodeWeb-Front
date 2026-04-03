<script setup>
import { useInfraStore } from "@ogw_front/stores/infra";

const { button_label, button_color, color } = defineProps({
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
  color: {
    type: String,
    required: false,
  },
});

const name = ref("");
const email = ref("");
const launch = ref(false);
const valid = ref(false);
const emailRules = [
  (value) => {
    if (value) {
      return true;
    }
    return "E-mail is required.";
  },
  (value) => {
    if (/.+@.+\..+/.test(value)) {
      return true;
    }
    return "E-mail must be valid.";
  },
];

function submit() {
  const infraStore = useInfraStore();
  return infraStore.create_backend(name.value, email.value, launch.value);
}
</script>

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
        :text="button_label"
        :color="color || button_color"
        @click="submit"
      />
    </VCol>
  </VRow>
</template>
