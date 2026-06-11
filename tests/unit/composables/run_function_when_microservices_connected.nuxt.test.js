// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";

// Local imports
import { Status } from "@ogw_front/utils/status";
import { runFunctionWhenMicroservicesConnected } from "@ogw_front/composables/runFunctionWhenMicroservicesConnected";
import { setupActivePinia } from "@ogw_tests/utils";
import { useBackStore } from "@ogw_front/stores/back";
import { useInfraStore } from "@ogw_front/stores/infra";
import { useViewerStore } from "@ogw_front/stores/viewer";

const dumb_obj = { dumb_method: () => true };
let infraStore = undefined;
let backStore = undefined;
let viewerStore = undefined;

describe("when_microservices_connected_run_function", () => {
  beforeEach(() => {
    setupActivePinia();
    infraStore = useInfraStore();
    backStore = useBackStore();
    viewerStore = useViewerStore();

    // Register microservices in infra store
    infraStore.register_microservice(backStore, {
      request: vi.fn(),
      connect: vi.fn(),
      launch: vi.fn(),
    });
    infraStore.register_microservice(viewerStore, {
      request: vi.fn(),
      connect: vi.fn(),
      launch: vi.fn(),
    });

    backStore.$patch({ status: Status.NOT_CONNECTED });
    viewerStore.$patch({ status: Status.NOT_CONNECTED });
  });

  test("microservices not connected", () => {
    const spy = vi.spyOn(dumb_obj, "dumb_method");
    runFunctionWhenMicroservicesConnected(dumb_obj.dumb_method);
    backStore.$patch({ status: Status.NOT_CONNECTED });
    viewerStore.$patch({ status: Status.NOT_CONNECTED });
    expect(spy).not.toHaveBeenCalled();
  });

  test("microservices connected", async () => {
    const spy = vi.spyOn(dumb_obj, "dumb_method");
    runFunctionWhenMicroservicesConnected(dumb_obj.dumb_method);
    backStore.$patch({ status: Status.CONNECTED });
    viewerStore.$patch({ status: Status.CONNECTED });
    await flushPromises();
    expect(spy).toHaveBeenCalledWith();
  });
});
