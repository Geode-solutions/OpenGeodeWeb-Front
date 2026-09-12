// Third party imports
import { beforeEach, describe, expect, test, vi } from "vitest";
import { flushPromises } from "@vue/test-utils";

// Local imports
import { Status } from "@ogw_front/utils/status";
import { runFunctionWhenMicroservicesConnected } from "@ogw_front/composables/run_function_when_microservices_connected";
import { setupActivePinia } from "@ogw_tests/utils";
import { useBackStore } from "@ogw_front/stores/back";
import { useInfraStore } from "@ogw_front/stores/infra";
// oxlint-disable-next-line eslint/no-duplicate-imports
import type { Microservice } from "@ogw_front/stores/infra";
import { useViewerStore } from "@ogw_front/stores/viewer";

const dumb_obj = { dumb_method: () => true };
// These are assigned in beforeEach (a real defined value by the time any test runs) rather than at declaration, so a `| undefined` type would just force needless narrowing at every call site below.
// oxlint-disable-next-line eslint/init-declarations
let infraStore: ReturnType<typeof useInfraStore>;
// oxlint-disable-next-line eslint/init-declarations
let backStore: ReturnType<typeof useBackStore>;
// oxlint-disable-next-line eslint/init-declarations
let viewerStore: ReturnType<typeof useViewerStore>;

describe("when_microservices_connected_run_function", () => {
  beforeEach(() => {
    setupActivePinia();
    infraStore = useInfraStore();
    backStore = useBackStore();
    viewerStore = useViewerStore();

    // Register microservices in infra store
    infraStore.register_microservice(backStore as unknown as Microservice);
    infraStore.register_microservice(viewerStore as unknown as Microservice);

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
