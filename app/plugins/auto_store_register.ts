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
  // An explicit param annotation here breaks Nuxt's Injections type inference for
  // DefineNuxtPlugin (nuxtApp.$pinia would resolve to `{}` instead of `Pinia`), so the
  // Implicit type is kept and this finding is left unfixed.
  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types
  setup(nuxtApp) {
    const { $pinia } = nuxtApp;
    if ($pinia === undefined) {
      return;
    }

    $pinia.use(autoStoreRegister);
  },
});
