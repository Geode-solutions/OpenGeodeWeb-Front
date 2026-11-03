import { type Ref, computed, ref, watch } from "vue";

interface ModelTabItem {
  label: string;
  value: string;
  testId: string;
}

interface ModelTabsOptions {
  componentType: Ref<string | undefined>;
  componentId: Ref<string | undefined>;
  isTypeSupported?: (type: string) => boolean;
  hasComponentsOptions?: Ref<boolean>;
}

const COMPONENT_TYPE_PLURALS: Record<string, string> = {
  Surface: "Surfaces",
  Line: "Lines",
  Corner: "Corners",
  Block: "Blocks",
};

function getComponentTypePlural(type: string): string {
  return COMPONENT_TYPE_PLURALS[type] ?? `${type}s`;
}

function isFilled(value: string | undefined): value is string {
  return value !== undefined && value !== "";
}

// Tabs depend on where the menu was opened: data, a component type or one component.
// Example: a picked surface gives Model | Surfaces | Surface, with Surface active.
// oxlint-disable-next-line typescript/explicit-function-return-type, typescript/explicit-module-boundary-types
function useModelTabs(options: ModelTabsOptions) {
  const { componentType, componentId, isTypeSupported, hasComponentsOptions } = options;

  const supportedType = computed<string | undefined>(() => {
    const type = componentType.value;
    if (!isFilled(type)) {
      return undefined;
    }
    if (isTypeSupported && !isTypeSupported(type)) {
      return undefined;
    }
    return type;
  });
  const isModelContext = computed<boolean>(
    () => !isFilled(componentType.value) && !isFilled(componentId.value),
  );

  const tabs = computed<ModelTabItem[]>(() => {
    const items: ModelTabItem[] = [{ label: "Model", value: "model", testId: "modelTab_model" }];
    const type = supportedType.value;
    if (isModelContext.value && (hasComponentsOptions?.value ?? true)) {
      items.push({
        label: "Components Options",
        value: "components",
        testId: "modelTab_components",
      });
    } else if (type !== undefined) {
      items.push({ label: getComponentTypePlural(type), value: "type", testId: "modelTab_type" });
      if (isFilled(componentId.value)) {
        items.push({ label: type, value: "component", testId: "modelTab_component" });
      }
    }
    return items;
  });

  const activeTab = ref<string>("model");
  watch(
    [supportedType, componentId],
    ([type, id]) => {
      if (type === undefined) {
        activeTab.value = "model";
      } else {
        activeTab.value = isFilled(id) ? "component" : "type";
      }
    },
    { immediate: true },
  );

  return { tabs, activeTab };
}

export { getComponentTypePlural, useModelTabs };
export type { ModelTabItem };
