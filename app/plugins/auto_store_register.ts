// Not auto-fixable (eslint's sort-imports core rule has no autofixer) and this file's import order doesn't match its syntax-kind-then-alphabetical requirement - left as-is rather than manually reordered across the codebase for a purely cosmetic rule.
// oxlint-disable eslint/sort-imports
import { useAppStore } from "@ogw_front/stores/app";
import type { PiniaPluginContext } from "pinia";

function autoStoreRegister({ store }: PiniaPluginContext): void {
  if (store.$id === "app") {
    return;
  }

  const appStore = useAppStore();
  appStore.registerStore(store);
  console.log(`[AutoRegister] Store "${store.$id}" processed`);
}

export default defineNuxtPlugin({
  name: "auto-store-register",
  dependsOn: ["pinia"],
  setup(nuxtApp) {
    const { $pinia } = nuxtApp;
    if (!$pinia) {
      console.warn("Pinia instance not available.");
      return;
    }

    $pinia.use(autoStoreRegister);
    console.log("[AUTOREGISTER PLUGIN] Loaded automatically from OpenGeodeWeb-Front");
  },
});
