import { describe, expect, test } from "vitest";
import { ref } from "vue";
import { getComponentTypePlural, useModelTabs } from "@ogw_front/composables/model_tabs";

describe("getComponentTypePlural", () => {
  test("returns plural for known types", () => {
    expect(getComponentTypePlural("Surface")).toBe("Surfaces");
    expect(getComponentTypePlural("Line")).toBe("Lines");
    expect(getComponentTypePlural("Corner")).toBe("Corners");
    expect(getComponentTypePlural("Block")).toBe("Blocks");
  });

  test("appends s for unknown types", () => {
    expect(getComponentTypePlural("Custom")).toBe("Customs");
  });
});

describe("useModelTabs", () => {
  test("returns Model and Components Options when clicking data in object tree", () => {
    const componentType = ref<string | undefined>(undefined);
    const componentId = ref<string | undefined>(undefined);

    const { tabs, activeTab } = useModelTabs({
      componentType,
      componentId,
    });

    expect(tabs.value).toEqual([
      { label: "Model", value: "model", testId: "modelTab_model" },
      { label: "Components Options", value: "components", testId: "modelTab_components" },
    ]);
    expect(activeTab.value).toBe("model");
  });

  test("returns Model and type (active) when clicking category like Corners in tree", () => {
    const componentType = ref<string | undefined>("Corner");
    const componentId = ref<string | undefined>(undefined);

    const { tabs, activeTab } = useModelTabs({
      componentType,
      componentId,
    });

    expect(tabs.value).toEqual([
      { label: "Model", value: "model", testId: "modelTab_model" },
      { label: "Corners", value: "type", testId: "modelTab_type" },
    ]);
    expect(activeTab.value).toBe("type");
  });

  test("returns Model, Lines, and Line (active) when clicking a specific Line", () => {
    const componentType = ref<string | undefined>("Line");
    const componentId = ref<string | undefined>("line-uuid-123");

    const { tabs, activeTab } = useModelTabs({
      componentType,
      componentId,
    });

    expect(tabs.value).toEqual([
      { label: "Model", value: "model", testId: "modelTab_model" },
      { label: "Lines", value: "type", testId: "modelTab_type" },
      { label: "Line", value: "component", testId: "modelTab_component" },
    ]);
    expect(activeTab.value).toBe("component");
  });

  test("returns Model, Surfaces, and Surface (active) when clicking a Surface in scene", () => {
    const componentType = ref<string | undefined>("Surface");
    const componentId = ref<string | undefined>("surface-uuid-456");

    const { tabs, activeTab } = useModelTabs({
      componentType,
      componentId,
    });

    expect(tabs.value).toEqual([
      { label: "Model", value: "model", testId: "modelTab_model" },
      { label: "Surfaces", value: "type", testId: "modelTab_type" },
      { label: "Surface", value: "component", testId: "modelTab_component" },
    ]);
    expect(activeTab.value).toBe("component");
  });

  test("respects isTypeSupported filter (e.g. Corners in Edges Card)", () => {
    const componentType = ref<string | undefined>("Corner");
    const componentId = ref<string | undefined>("corner-uuid-789");

    const { tabs, activeTab } = useModelTabs({
      componentType,
      componentId,
      isTypeSupported: (type) => type === "Surface" || type === "Block",
    });

    expect(tabs.value).toEqual([
      { label: "Model", value: "model", testId: "modelTab_model" },
    ]);
    expect(activeTab.value).toBe("model");
  });

  test("updates activeTab when context changes", async () => {
    const componentType = ref<string | undefined>(undefined);
    const componentId = ref<string | undefined>(undefined);

    const { activeTab } = useModelTabs({
      componentType,
      componentId,
    });

    expect(activeTab.value).toBe("model");

    componentType.value = "Surface";
    componentId.value = "surf-1";
    await nextTick();
    expect(activeTab.value).toBe("component");

    componentType.value = "Corner";
    componentId.value = undefined;
    await nextTick();
    expect(activeTab.value).toBe("type");
  });
});
