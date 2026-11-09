// Third party imports
import { type VueWrapper, flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import Screenshot from "@ogw_front/components/Screenshot.vue";
import { vuetify } from "@ogw_tests/utils";

const VIEW_WIDTH = 800;
const VIEW_HEIGHT = 600;
const MAX_SIZE = 8192;
const LOCKED_WIDTH = 1600;
const LOCKED_HEIGHT = 1200;
const EDITED_HEIGHT = 300;
const EDITED_WIDTH = 400;
const CLAMPED_HEIGHT = 6144;
const WINDOW_WIDTH = 1000;
const WINDOW_HEIGHT = 500;
const PIXEL_RATIO = 2;

const request = vi.fn<(...args: unknown[]) => Promise<void>>().mockResolvedValue();
const add_error = vi.fn<(...args: unknown[]) => void>();
const view_size = { width: VIEW_WIDTH, height: VIEW_HEIGHT };

vi.mock(import("@ogw_front/stores/viewer") as Promise<unknown>, () => ({
  useViewerStore: (): { request: typeof request; view_size: typeof view_size } => ({
    request,
    view_size,
  }),
}));
vi.mock(import("@ogw_front/stores/feedback") as Promise<unknown>, () => ({
  useFeedbackStore: (): Record<string, unknown> => ({
    add_error,
    add_success: vi.fn<() => void>(),
  }),
}));

type SizeSetter = (value: number | undefined) => void;

function sizeInput(wrapper: VueWrapper, id: string): string {
  // oxlint-disable-next-line no-unsafe-type-assertion -- the DOM input value is a string
  return (wrapper.find(`[data-testid="${id}"] input`).element as HTMLInputElement).value;
}

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

  test("initialises the size from the view and locks its ratio", async () => {
    const state = await mountScreenshot();
    expect(state.screenshot_size).toStrictEqual({ width: VIEW_WIDTH, height: VIEW_HEIGHT });

    // oxlint-disable-next-line no-unsafe-type-assertion -- script setup functions are not typed on vm
    (state.setWidth as SizeSetter)(LOCKED_WIDTH);
    expect(state.screenshot_size).toStrictEqual({ width: LOCKED_WIDTH, height: LOCKED_HEIGHT });

    // oxlint-disable-next-line no-unsafe-type-assertion -- script setup functions are not typed on vm
    (state.setHeight as SizeSetter)(EDITED_HEIGHT);
    expect(state.screenshot_size).toStrictEqual({ width: EDITED_WIDTH, height: EDITED_HEIGHT });

    // A cleared field keeps the current size
    // oxlint-disable-next-line no-unsafe-type-assertion -- script setup functions are not typed on vm
    (state.setWidth as SizeSetter)(undefined);
    expect(state.screenshot_size).toStrictEqual({ width: EDITED_WIDTH, height: EDITED_HEIGHT });
  });

  test("clamps the size to the RPC bounds", async () => {
    const state = await mountScreenshot();
    // oxlint-disable-next-line no-unsafe-type-assertion -- script setup functions are not typed on vm
    (state.setWidth as SizeSetter)(MAX_SIZE * 2);
    expect(state.screenshot_size).toStrictEqual({ width: MAX_SIZE, height: CLAMPED_HEIGHT });

    // oxlint-disable-next-line no-unsafe-type-assertion -- script setup functions are not typed on vm
    (state.setHeight as SizeSetter)(0);
    expect(state.screenshot_size).toStrictEqual({ width: 1, height: 1 });
  });

  test("shows the read-only tab size when UI is included", async () => {
    vi.stubGlobal("innerWidth", WINDOW_WIDTH);
    vi.stubGlobal("innerHeight", WINDOW_HEIGHT);
    vi.stubGlobal("devicePixelRatio", PIXEL_RATIO);
    globalThis.dispatchEvent(new Event("resize"));
    const wrapper = await mountSuspended(Screenshot, {
      global: { plugins: [vuetify] },
      props: { modelValue: true },
    });
    expect(sizeInput(wrapper, "screenshotWidthInput")).toBe(String(VIEW_WIDTH));

    // oxlint-disable-next-line no-unsafe-type-assertion -- script setup refs are not typed on vm
    (wrapper.vm as unknown as { include_ui: boolean }).include_ui = true;
    await flushPromises();

    const width_input = wrapper.find('[data-testid="screenshotWidthInput"] input');
    expect(width_input.attributes("readonly")).toBeDefined();
    expect(sizeInput(wrapper, "screenshotWidthInput")).toBe(String(WINDOW_WIDTH * PIXEL_RATIO));
    expect(sizeInput(wrapper, "screenshotHeightInput")).toBe(String(WINDOW_HEIGHT * PIXEL_RATIO));
    expect(wrapper.find('[data-testid="screenshotWidthInput"]').text()).toContain("≈");
    vi.unstubAllGlobals();
  });

  test("sends the chosen size with the scene screenshot request", async () => {
    request.mockClear();
    const state = await mountScreenshot();
    state.filename = "scene";
    // oxlint-disable-next-line no-unsafe-type-assertion -- script setup functions are not typed on vm
    (state.setWidth as SizeSetter)(LOCKED_WIDTH);

    // oxlint-disable-next-line no-unsafe-type-assertion -- script setup functions are not typed on vm
    await (state.takeScreenshot as () => Promise<void>)();

    expect(request.mock.calls[0]?.[0]).toMatchObject({ params: { width: LOCKED_WIDTH, height: LOCKED_HEIGHT } });
  });
});
