// Third party imports
import { describe, expect, test } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";

// Local imports
import BasemapAttribution from "@ogw_front/components/BasemapAttribution.vue";
import { useBasemapStore } from "@ogw_front/stores/basemap";

const ATTRIBUTION = 'data-testid="basemapAttribution"';
const TIMEOUT = 5000;

describe("basemap attribution", () => {
  test(
    "shows the attribution when defined",
    async () => {
      useBasemapStore().attribution = "© Test tiles";
      const wrapper = await mountSuspended(BasemapAttribution);
      expect(wrapper.html()).toContain(ATTRIBUTION);
      expect(wrapper.text()).toBe("© Test tiles");
    },
    TIMEOUT,
  );

  test(
    "shows nothing without attribution",
    async () => {
      useBasemapStore().attribution = undefined;
      const wrapper = await mountSuspended(BasemapAttribution);
      expect(wrapper.html()).not.toContain(ATTRIBUTION);
    },
    TIMEOUT,
  );
});
