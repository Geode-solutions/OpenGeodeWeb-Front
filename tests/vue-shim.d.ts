// Ambient module declaration so plain `tsc` (no vue-tsc) can resolve `.vue`
// component imports in test files. Component prop/emit types are erased to a
// generic DefineComponent here; the app project's own typecheck (via
// `nuxt typecheck`) is what actually validates component internals.
declare module "*.vue" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>;
  export default component;
}
