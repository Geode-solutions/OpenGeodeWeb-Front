import type { PiniaPluginContext } from "pinia";
import { useAppStore } from "@ogw_front/stores/app";

function autoStoreRegister({ store }: Readonly<PiniaPluginContext>): void {
  if (store.$id === "app") {
    return;
  }

  const appStore = useAppStore();
  appStore.registerStore(store);
}

export default defineNuxtPlugin({
  name: "auto-store-register",
  dependsOn: ["pinia"],
  setup(nuxtApp) {
    const { $pinia } = nuxtApp;
    if ($pinia === undefined) {
      return;
    }

    $pinia.use(autoStoreRegister);
  },
});
