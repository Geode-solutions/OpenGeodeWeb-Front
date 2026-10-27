// Third party imports
import { type Mock, beforeEach, describe, expect, test, vi } from "vitest";
import { VSlider } from "vuetify/components";
import type { VueWrapper } from "@vue/test-utils";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { reactive } from "vue";

// Local imports
import ActionButton from "@ogw_front/components/ActionButton.vue";
import ViewToolbar from "@ogw_front/components/ViewToolbar.vue";
import { vuetify } from "@ogw_tests/utils";

interface FakeBasemap {
  style: string;
  opacity: number;
  available: boolean;
  loading: boolean;
  setStyle: Mock<(styleName: string) => void>;
  setOpacity: Mock<(value: number) => void>;
  around: boolean;
  setAround: Mock<(value: boolean) => void>;
}

const basemapState = vi.hoisted(() => ({ value: undefined as unknown }));

vi.mock(import("@ogw_front/stores/basemap") as Promise<unknown>, () => ({
  useBasemapStore: (): unknown => basemapState.value,
}));

const SATELLITE = '[data-testid="basemapStyle-satellite"]';
const OPACITY = '[data-testid="basemapOpacity"]';
const AROUND = '[data-testid="basemapAround"]';
const TIMEOUT = 5000;
const PERCENT = 50;
const FULL = 100;

let basemap: FakeBasemap = reactive({
  style: "none",
  opacity: 1,
  available: true,
  loading: false,
  setStyle: vi.fn<(styleName: string) => void>(),
  setOpacity: vi.fn<(value: number) => void>(),
  around: true,
  setAround: vi.fn<(value: boolean) => void>(),
});

// An open menu has its content in an active overlay
function isShown(selector: string): boolean {
  const element = document.querySelector(selector);
  return element?.closest(".v-overlay--active") !== null && element !== null;
}

async function mountToolbar(): Promise<VueWrapper> {
  const wrapper = await mountSuspended(ViewToolbar, {
    attachTo: document.body,
    global: { plugins: [vuetify] },
  });
  return wrapper;
}

describe("view toolbar basemap", () => {
  beforeEach(() => {
    vi.stubGlobal("visualViewport", new EventTarget());
    basemap = reactive({
      style: "none",
      opacity: 1,
      available: true,
      loading: false,
      setStyle: vi.fn<(styleName: string) => void>(),
      setOpacity: vi.fn<(value: number) => void>(),
      around: true,
      setAround: vi.fn<(value: boolean) => void>(),
    });
    basemapState.value = basemap;
    document.body.innerHTML = "";
  });

  test(
    "disabled without CRS, with explanatory tooltip, and does not open its menu",
    async () => {
      basemap.available = false;
      const wrapper = await mountToolbar();
      const button = wrapper.find('[data-testid="basemapButton"]');
      expect(button.attributes("disabled")).toBeDefined();
      const action = wrapper
        .findAllComponents(ActionButton)
        .find(
          (component: { attributes: (name: string) => string | undefined }) =>
            component.attributes("data-testid") === "basemapButton",
        );
      expect(action?.props("tooltip")).toBe("Assign a CRS to display a basemap");
      await button.trigger("click");
      expect(document.querySelector(SATELLITE)).toBeNull();
    },
    TIMEOUT,
  );

  test(
    "selecting a style calls setStyle",
    async () => {
      const wrapper = await mountToolbar();
      await wrapper.find('[data-testid="basemapButton"]').trigger("click");
      const item = document.querySelector<HTMLElement>(SATELLITE);
      expect(item).not.toBeNull();
      item?.click();
      expect(basemap.setStyle).toHaveBeenCalledWith("satellite");
    },
    TIMEOUT,
  );

  test(
    "primary when a style is active, loading while loading",
    async () => {
      basemap.style = "streets";
      basemap.loading = true;
      const wrapper = await mountToolbar();
      const classes = wrapper.find('[data-testid="basemapButton"]').classes();
      expect(classes).toContain("bg-primary");
      expect(classes).toContain("v-btn--loading");
    },
    TIMEOUT,
  );

  test(
    "choosing a style closes the basemap menu",
    async () => {
      const wrapper = await mountToolbar();
      await wrapper.find('[data-testid="basemapButton"]').trigger("click");
      expect(isShown(SATELLITE)).toBe(true);
      document.querySelector<HTMLElement>(SATELLITE)?.click();
      await vi.waitFor(() => {
        expect(isShown(SATELLITE)).toBe(false);
      });
    },
    TIMEOUT,
  );

  test(
    "the opacity slider is disabled without basemap and sends the opacity",
    async () => {
      const wrapper = await mountToolbar();
      await wrapper.find('[data-testid="basemapButton"]').trigger("click");
      const slider = document.querySelector(OPACITY);
      expect(slider).not.toBeNull();
      expect(slider?.classList).toContain("v-input--disabled");
      basemap.style = "satellite";
      await wrapper.vm.$nextTick();
      expect(document.querySelector(OPACITY)?.classList).not.toContain("v-input--disabled");
      wrapper.findComponent(VSlider).vm.$emit("update:modelValue", PERCENT);
      expect(basemap.setOpacity).toHaveBeenCalledWith(PERCENT / FULL);
      // Moving the slider keeps the menu open
      expect(isShown(OPACITY)).toBe(true);
    },
    TIMEOUT,
  );

  test(
    "the map around switch is disabled without basemap and asks the store",
    async () => {
      const wrapper = await mountToolbar();
      await wrapper.find('[data-testid="basemapButton"]').trigger("click");
      expect(document.querySelector(AROUND)?.classList).toContain("v-input--disabled");
      basemap.style = "satellite";
      await wrapper.vm.$nextTick();
      document.querySelector<HTMLInputElement>(`${AROUND} input`)?.click();
      expect(basemap.setAround).toHaveBeenCalledWith(false);
    },
    TIMEOUT,
  );
});
