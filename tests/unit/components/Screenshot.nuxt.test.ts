// Third party imports
import { describe, expect, test, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import Screenshot from "@ogw_front/components/Screenshot.vue";
import { vuetify } from "@ogw_tests/utils";

const request = vi.fn<() => Promise<void>>().mockResolvedValue();
const add_error = vi.fn<(...args: unknown[]) => void>();

vi.mock(import("@ogw_front/stores/viewer") as Promise<unknown>, () => ({
  useViewerStore: (): { request: typeof request } => ({ request }),
}));
vi.mock(import("@ogw_front/stores/feedback") as Promise<unknown>, () => ({
  useFeedbackStore: (): Record<string, unknown> => ({
    add_error,
    add_success: vi.fn<() => void>(),
  }),
}));

async function mountScreenshot(): Promise<Record<string, unknown>> {
  const wrapper = await mountSuspended(Screenshot, {
    global: { plugins: [vuetify] },
    props: { modelValue: true },
  });
  return wrapper.vm;
}

describe("screenshot", () => {
  test("has no background color picker", async () => {
    const wrapper = await mountSuspended(Screenshot, {
      global: { plugins: [vuetify] },
      props: { modelValue: true },
    });
    expect(wrapper.find('[data-testid="screenshotIncludeBackgroundSwitch"]').exists()).toBe(true);
    expect(wrapper.find('[data-testid="screenshotBackgroundColorPicker"]').exists()).toBe(false);
  });

  test("captures the page instead of the scene when UI is included", async () => {
    const getDisplayMedia = vi
      .fn<(options: unknown) => Promise<MediaStream>>()
      .mockRejectedValue(new Error("Permission denied"));
    Object.defineProperty(navigator, "mediaDevices", {
      value: { getDisplayMedia },
      configurable: true,
    });
    request.mockClear();
    const state = await mountScreenshot();
    state.filename = "capture";
    state.include_ui = true;
    await flushPromises();

    // oxlint-disable-next-line no-unsafe-type-assertion -- script setup functions are not typed on vm
    await (state.takeScreenshot as () => Promise<void>)();

    expect(getDisplayMedia).toHaveBeenCalledWith(
      expect.objectContaining({ preferCurrentTab: true }),
    );
    expect(request).not.toHaveBeenCalled();
    expect(add_error).toHaveBeenCalledWith(
      0,
      "",
      "Screenshot Error",
      expect.stringContaining("Permission denied"),
    );
  });
});
