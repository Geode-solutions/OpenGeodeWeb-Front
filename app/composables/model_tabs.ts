import { type ComputedRef, type Ref, computed, ref, watch } from "vue";

export interface ModelTabItem {
  label: string;
  value: string;
  testId?: string;
}

const COMPONENT_TYPE_PLURALS: Record<string, string> = {
  Surface: "Surfaces",
  Line: "Lines",
  Corner: "Corners",
  Block: "Blocks",
};

export function getComponentTypePlural(type: string): string {
  return COMPONENT_TYPE_PLURALS[type] ?? `${type}s`;
}

interface UseModelTabsOptions {
  componentType: Ref<string | undefined> | ComputedRef<string | undefined>;
  componentId: Ref<string | undefined> | ComputedRef<string | undefined>;
  isTypeSupported?: (type: string | undefined) => boolean;
  hasComponentsOptions?: Ref<boolean> | ComputedRef<boolean>;
}

export function useModelTabs(options: UseModelTabsOptions): {
  tabs: ComputedRef<ModelTabItem[]>;
  activeTab: Ref<string>;
} {
  const isSupported = (type: string | undefined) =>
    options.isTypeSupported ? options.isTypeSupported(type) : type !== undefined;

  const tabs = computed<ModelTabItem[]>(() => {
    const type = options.componentType.value;
    const id = options.componentId.value;

    const items: ModelTabItem[] = [{ label: "Model", value: "model", testId: "modelTab_model" }];

    if (!type && !id) {
      const showComponents =
        options.hasComponentsOptions !== undefined ? options.hasComponentsOptions.value : true;
      if (showComponents) {
        items.push({
          label: "Components Options",
          value: "components",
          testId: "modelTab_components",
        });
      }
      return items;
    }

    if (type && isSupported(type)) {
      items.push({
        label: getComponentTypePlural(type),
        value: "type",
        testId: "modelTab_type",
      });
      if (id) {
        items.push({
          label: type,
          value: "component",
          testId: "modelTab_component",
        });
      }
    }

    return items;
  });

  const activeTab = ref<string>("model");

  watch(
    [() => options.componentType.value, () => options.componentId.value],
    ([type, id]) => {
      if (!type && !id) {
        activeTab.value = "model";
      } else if (type && isSupported(type)) {
        activeTab.value = id ? "component" : "type";
      } else {
        activeTab.value = "model";
      }
    },
    { immediate: true },
  );

  return { tabs, activeTab };
}
