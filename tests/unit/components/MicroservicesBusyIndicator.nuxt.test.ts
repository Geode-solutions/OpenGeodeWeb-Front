// Third party imports
import { beforeEach, describe, expect, test } from "vitest";
import { mount } from "@vue/test-utils";

// Local imports
import { setupActivePinia, vuetify } from "@ogw_tests/utils";
import MicroservicesBusyIndicator from "@ogw_front/components/MicroservicesBusyIndicator.vue";
import { useBackStore } from "@ogw_front/stores/back";
import { useInfraStore } from "@ogw_front/stores/infra";

const NO_REQUEST = 0;
const ONE_REQUEST = 1;

describe("microservices busy indicator", () => {
  const pinia = setupActivePinia();

  beforeEach(() => {
    const infraStore = useInfraStore();
    const backStore = useBackStore();
    backStore.request_counter = NO_REQUEST;
    infraStore.register_microservice(backStore);
  });

  test("hidden when no microservice is busy", () => {
    const wrapper = mount(MicroservicesBusyIndicator, {
      global: { plugins: [vuetify, pinia] },
    });
    expect(wrapper.find('[data-testid="microservicesBusyIndicator"]').exists()).toBe(false);
  });

  test("shown while a microservice request is in flight", async () => {
    const backStore = useBackStore();
    const wrapper = mount(MicroservicesBusyIndicator, {
      global: { plugins: [vuetify, pinia] },
    });
    backStore.request_counter = ONE_REQUEST;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="microservicesBusyIndicator"]').exists()).toBe(true);
    backStore.request_counter = NO_REQUEST;
    await wrapper.vm.$nextTick();
    expect(wrapper.find('[data-testid="microservicesBusyIndicator"]').exists()).toBe(false);
  });
});
