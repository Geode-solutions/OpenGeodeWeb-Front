import { beforeEach, describe, expect, test, vi } from "vitest"
import Status from "@ogw_front/utils/status"

import { createTestingPinia } from "@pinia/testing"
import { setActivePinia } from "pinia"

import { run_function_when_microservices_connected } from "@ogw_front/composables/run_function_when_microservices_connected"
import { useGeodeStore } from "@ogw_front/stores/geode"
import { useInfraStore } from "@ogw_front/stores/infra"
import { useViewerStore } from "@ogw_front/stores/viewer"

describe("run function when microservices are connected", () => {
  const dumb_obj = { dumb_method: () => true }

  beforeEach(async () => {
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

    await geodeStore.$patch({ status: Status.NOT_CONNECTED })
    await viewerStore.$patch({ status: Status.NOT_CONNECTED })
  })

  it("fails when microservices are not connected", async () => {
    const geodeStore = useGeodeStore()
    const viewerStore = useViewerStore()
    const infraStore = useInfraStore()
    const spy = vi.spyOn(dumb_obj, "dumb_method")
    run_function_when_microservices_connected(dumb_obj.dumb_method)
    await geodeStore.$patch({ status: Status.NOT_CONNECTED })
    await viewerStore.$patch({ status: Status.NOT_CONNECTED })
    console.log("geodeStore", geodeStore.status)
    console.log("viewerStore", viewerStore.status)

    console.log("microservices_connected", infraStore.microservices_connected)
    expect(spy).not.toHaveBeenCalled()
  })

  it("doesn't run when microservices remain not connected", async () => {
    const geodeStore = useGeodeStore()
    const viewerStore = useViewerStore()
    const infraStore = useInfraStore()
    const spy = vi.spyOn(dumb_obj, "dumb_method")
    run_function_when_microservices_connected(dumb_obj.dumb_method)
    await geodeStore.$patch({ status: Status.NOT_CONNECTED })
    await viewerStore.$patch({ status: Status.NOT_CONNECTED })
    console.log("geodeStore", geodeStore.status)
    console.log("viewerStore", viewerStore.status)

    console.log("microservices_connected", infraStore.microservices_connected)
    expect(spy).not.toHaveBeenCalled()
  })

  it("runs only when microservices are connected", async () => {
    const geodeStore = useGeodeStore()
    const viewerStore = useViewerStore()
    const spy = vi.spyOn(dumb_obj, "dumb_method")
    run_function_when_microservices_connected(dumb_obj.dumb_method)
    await geodeStore.$patch({ status: Status.CONNECTED })
    await viewerStore.$patch({ status: Status.CONNECTED })
    expect(spy).toHaveBeenCalledWith()
  })
})
