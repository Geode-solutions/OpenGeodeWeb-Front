// Third party imports
import { describe, expect, test } from "vitest";
import { nextTick, ref } from "vue";

// Local imports
import { getComponentTypePlural, useModelTabs } from "@ogw_front/composables/model_tabs";

const MODEL_TAB = { label: "Model", value: "model", testId: "modelTab_model" };
const SURFACES_TAB = { label: "Surfaces", value: "type", testId: "modelTab_type" };
const SURFACE_TAB = { label: "Surface", value: "component", testId: "modelTab_component" };

// oxlint-disable-next-line typescript/explicit-function-return-type
function setupModelTabs(type?: string, id?: string, supportedTypes?: string[]) {
  const componentType = ref<string | undefined>(type);
  const componentId = ref<string | undefined>(id);
  const isTypeSupported = supportedTypes
    ? (componentTypeName: string): boolean => supportedTypes.includes(componentTypeName)
    : undefined;
  return {
    componentType,
    componentId,
    ...useModelTabs({ componentType, componentId, isTypeSupported }),
  };
}

describe("component type plural", () => {
  test("plural of known and unknown types", () => {
    expect(getComponentTypePlural("Corner")).toBe("Corners");
    expect(getComponentTypePlural("Custom")).toBe("Customs");
  });
});

describe("model tabs", () => {
  test("data from object tree", () => {
    const { tabs, activeTab } = setupModelTabs();
    expect(tabs.value).toStrictEqual([
      MODEL_TAB,
      { label: "Components Options", value: "components", testId: "modelTab_components" },
    ]);
    expect(activeTab.value).toBe("model");
  });

  test("component type from components tree", () => {
    const { tabs, activeTab } = setupModelTabs("Surface");
    expect(tabs.value).toStrictEqual([MODEL_TAB, SURFACES_TAB]);
    expect(activeTab.value).toBe("type");
  });

  test("one component from scene or components tree", () => {
    const { tabs, activeTab } = setupModelTabs("Surface", "surface_id");
    expect(tabs.value).toStrictEqual([MODEL_TAB, SURFACES_TAB, SURFACE_TAB]);
    expect(activeTab.value).toBe("component");
  });

  test("unsupported component type", () => {
    const { tabs, activeTab } = setupModelTabs("Corner", "corner_id", ["Surface", "Block"]);
    expect(tabs.value).toStrictEqual([MODEL_TAB]);
    expect(activeTab.value).toBe("model");
  });

  test("component type resolved after component id", async () => {
    const { componentType, activeTab } = setupModelTabs(undefined, "surface_id");
    expect(activeTab.value).toBe("model");
    componentType.value = "Surface";
    await nextTick();
    expect(activeTab.value).toBe("component");
  });
});
