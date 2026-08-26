// Third party imports
import { describe, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import ToolPanel from "@ogw_front/components/ToolPanel";
import { vuetify } from "@ogw_tests/utils";

const FIRST_INDEX = 0;

describe("tool panel", () => {
  test("renders title and slot content when open", async () => {
    const wrapper = await mountSuspended(ToolPanel, {
      global: {
        plugins: [vuetify],
      },
      props: {
        modelValue: true,
        title: "Test Panel",
      },
      slots: {
        default: () => "Panel Content",
      },
    });

    expect(wrapper.text()).toContain("Test Panel");
    expect(wrapper.text()).toContain("Panel Content");
  });

  test("triggers escape key binding to close panel", async () => {
    const wrapper = await mountSuspended(ToolPanel, {
      global: {
        plugins: [vuetify],
      },
      props: {
        modelValue: true,
        title: "Test Panel",
      },
    });

    globalThis.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await wrapper.vm.$nextTick();

    expect(wrapper.emitted()).toHaveProperty("update:modelValue");
    expect(wrapper.emitted("update:modelValue")[FIRST_INDEX]).toStrictEqual([false]);
  });

  test("calls escapeFunction prop when Escape key is pressed", async () => {
    const escapeFunction = vi.fn();
    const wrapper = await mountSuspended(ToolPanel, {
      global: {
        plugins: [vuetify],
      },
      props: {
        escapeFunction,
        modelValue: true,
        title: "Test Panel",
      },
    });

    globalThis.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await wrapper.vm.$nextTick();

    expect(escapeFunction).toHaveBeenCalledWith();
  });
});
