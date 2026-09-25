import { ClickOutside } from "vuetify/directives/click-outside";
import type { DirectiveBinding } from "vue";

type ClickOutsideValue =
  | ((event: MouseEvent) => void)
  | {
      handler: (event: MouseEvent) => void;
      closeConditional?: (event: Event) => boolean;
      include?: () => HTMLElement[];
    };

function snackbarElements(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(".v-snackbar")];
}

export default defineNuxtPlugin({
  name: "click-outside-ignore-snackbars",
  setup() {
    const originalMounted = ClickOutside.mounted.bind(ClickOutside);

    ClickOutside.mounted = (
      element: HTMLElement,
      binding: DirectiveBinding<ClickOutsideValue>,
    ): void => {
      const { value } = binding;
      const handler = typeof value === "function" ? value : value.handler;
      const closeConditional = typeof value === "function" ? undefined : value.closeConditional;
      const include = typeof value === "function" ? undefined : value.include;

      binding.value = {
        handler,
        closeConditional,
        include: (): HTMLElement[] => [...(include?.() ?? []), ...snackbarElements()],
      };

      originalMounted(element, binding);
    };
  },
});
