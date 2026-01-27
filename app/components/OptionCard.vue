<script setup>
  import { useTheme } from "vuetify"

  const theme = useTheme()
  const primaryColor = computed(() => theme.current.value.colors.primary)

  defineProps({
    title: { type: String, default: "" },
    width: { type: [Number, String], default: 320 },
    maxHeight: { type: [Number, String], default: 500 },
  })
</script>
<template>
  <v-card
    @click.stop
    :title="title"
    class="option-card rounded-xl border-thin elevation-24"
    :width="width"
    :max-height="maxHeight"
    :ripple="false"
    theme="dark"
  >
    <v-card-text class="pa-5">
      <slot />
    </v-card-text>
    <v-card-actions v-if="$slots.actions" class="justify-center pb-4">
      <slot name="actions" />
    </v-card-actions>
  </v-card>
</template>

<style scoped>
  .option-card {
    background-color: rgba(30, 30, 30, 0.85) !important;
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-color: rgba(255, 255, 255, 0.15) !important;
  }

  ::v-deep(.v-list-item:hover) {
    background-color: rgba(255, 255, 255, 0.1);
  }

  ::v-deep(.v-slider-track__fill),
  ::v-deep(.v-selection-control--dirty .v-switch__track) {
    background-color: v-bind(primaryColor) !important;
  }

  ::v-deep(.v-btn) {
    border-radius: 8px;
    text-transform: none;
    font-weight: 500;
    letter-spacing: normal;
  }
</style>
