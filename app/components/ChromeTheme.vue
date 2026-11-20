<script setup lang="ts">
import { useChromeTheme } from "@ogw_front/composables/chrome_theme";

const chromeTheme = useChromeTheme();
</script>

<template>
  <!-- Applies the app's chrome theme (see composables/chrome_theme.ts) to its content, both to the
  Vuetify components and to the CSS theme variables; display: contents keeps it out of the layout. -->
  <v-theme-provider :theme="chromeTheme" with-background class="ogw-chrome-theme">
    <slot />
  </v-theme-provider>
</template>

<style scoped>
.ogw-chrome-theme {
  display: contents;
  background: transparent !important;
}
</style>
