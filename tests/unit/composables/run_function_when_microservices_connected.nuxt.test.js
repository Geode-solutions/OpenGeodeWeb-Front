import { describe, expect, test, vi } from "vitest"
import Status from "@ogw_front/utils/status"
import { flushPromises } from "@vue/test-utils"

import { createTestingPinia } from "@pinia/testing"
import { setActivePinia } from "pinia"

import { run_function_when_microservices_connected } from "@ogw_front/composables/run_function_when_microservices_connected"
import { useGeodeStore } from "@ogw_front/stores/geode"
import { useInfraStore } from "@ogw_front/stores/infra"
import { useViewerStore } from "@ogw_front/stores/viewer"

describe("when_microservices_connected_run_function", () => {
  const dumb_obj = { dumb_method: () => true }

  function setup() {
    const pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn,
    })
    setActivePinia(pinia)
    const infraStore = useInfraStore()
    const geodeStore = useGeodeStore()
    const viewerStore = useViewerStore()

    // Register microservices in infra store
    infraStore.register_microservice(geodeStore, {
      request: vi.fn(),
      connect: vi.fn(),
      launch: vi.fn(),
    })
    infraStore.register_microservice(viewerStore, {
      request: vi.fn(),
      connect: vi.fn(),
      launch: vi.fn(),
    })

    geodeStore.$patch({ status: Status.NOT_CONNECTED })
    viewerStore.$patch({ status: Status.NOT_CONNECTED })

    return { infraStore, geodeStore, viewerStore }
  }

  test("microservices not connected", async () => {
    const { infraStore, geodeStore, viewerStore } = setup()
    const spy = vi.spyOn(dumb_obj, "dumb_method")
    run_function_when_microservices_connected(dumb_obj.dumb_method)
    geodeStore.$patch({ status: Status.NOT_CONNECTED })
    viewerStore.$patch({ status: Status.NOT_CONNECTED })
    console.log("geodeStore", geodeStore.status)
    console.log("viewerStore", viewerStore.status)

    console.log("microservices_connected", infraStore.microservices_connected)
    expect(spy).not.toHaveBeenCalled()
  })

  test("microservices connected", async () => {
    const { geodeStore, viewerStore } = setup()
    const spy = vi.spyOn(dumb_obj, "dumb_method")
    run_function_when_microservices_connected(dumb_obj.dumb_method)
    geodeStore.$patch({ status: Status.CONNECTED })
    viewerStore.$patch({ status: Status.CONNECTED })
    await flushPromises()
    expect(spy).toHaveBeenCalledWith()
  })
})
